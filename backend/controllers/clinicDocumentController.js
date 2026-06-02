const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabaseStorage');

/**
 * Get clinic ID from authenticated user
 * This function can be extended based on how clinic staff authentication works
 */
async function getClinicId(req) {
    console.log('getClinicId - req.user:', req.user);
    
    // If clinic_id is directly on user
    if (req.user.clinic_id) return req.user.clinic_id;
    
    // If user has role clinic, look up clinic by user_id
    if (req.user.role === 'clinic') {
        const clinic = await prisma.clinics.findFirst({
            where: { user_id: req.user.user_id }
        });
        console.log('getClinicId - clinic lookup:', clinic);
        if (clinic) return clinic.id;
    }
    
    // If user is a clinic staff member, look up their clinic
    if (req.user.user_id) {
        const staff = await prisma.clinic_staff.findFirst({
            where: { user_id: req.user.user_id }
        });
        console.log('getClinicId - staff lookup:', staff);
        if (staff) return staff.clinic_id;
    }
    
    // If user has a role that includes clinic_id
    if (req.user.role === 'clinic_admin' || req.user.role === 'staff') {
        const staff = await prisma.clinic_staff.findFirst({
            where: { user_id: req.user.user_id }
        });
        if (staff) return staff.clinic_id;
    }
    
    console.log('getClinicId - returning null, no clinic found');
    return null;
}

// Upload clinic document - stores file in Supabase and URL in database
exports.uploadClinicDocument = async (req, res, next) => {
    try {
        const clinic_id = await getClinicId(req);
        if (!clinic_id) return ResponseHandler.badRequest(res, 'Clinic not identified');

        if (!req.file) {
            return ResponseHandler.badRequest(res, 'No file uploaded');
        }

        const { document_type } = req.body;
        
        // Upload to Supabase storage under clinic folder
        const uploadResult = await uploadToSupabase(
            req.file.buffer,
            req.file.originalname,
            'clinic/documents'
        );

        if (!uploadResult.success) {
            console.error('Supabase upload failed:', uploadResult.error);
            return ResponseHandler.serverError(res, 'Failed to upload file to storage');
        }

        // Store file URL in database
        const document = await prisma.clinic_document.create({
            data: {
                clinic_id,
                document_type: document_type || 'Other',
                file_url: uploadResult.url,
                mime_type: req.file.mimetype,
                file_size: req.file.size,
                file_name: req.file.originalname
            }
        });

        ResponseHandler.created(res, {
            id: document.id,
            file_name: document.file_name,
            file_url: document.file_url,
            document_type: document.document_type,
            mime_type: document.mime_type,
            file_size: document.file_size,
            uploaded_at: document.uploaded_at
        }, 'Clinic document uploaded successfully');
    } catch (error) {
        next(error);
    }
};

// Get all documents for the clinic
exports.getClinicDocuments = async (req, res, next) => {
    try {
        const clinic_id = await getClinicId(req);
        if (!clinic_id) return ResponseHandler.badRequest(res, 'Clinic not identified');

        const { document_type } = req.query;
        
        const whereClause = { clinic_id };
        if (document_type) {
            whereClause.document_type = document_type;
        }

        // Return metadata including file_url
        const documents = await prisma.clinic_document.findMany({
            where: whereClause,
            select: {
                id: true,
                file_name: true,
                file_url: true,
                document_type: true,
                mime_type: true,
                file_size: true,
                uploaded_at: true
            },
            orderBy: { uploaded_at: 'desc' }
        });

        ResponseHandler.success(res, documents, 'Clinic documents retrieved successfully');
    } catch (error) {
        next(error);
    }
};

// View a clinic document - redirect to Supabase URL
exports.getClinicDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinic_id = await getClinicId(req);
        
        const document = await prisma.clinic_document.findFirst({
            where: { 
                id: parseInt(id),
                clinic_id: clinic_id
            }
        });

        if (!document || !document.file_url) {
            return ResponseHandler.notFound(res, 'Document not found');
        }

        // Redirect to the Supabase URL
        res.redirect(document.file_url);
    } catch (error) {
        next(error);
    }
};

// Download clinic document - redirect to Supabase URL for download
exports.downloadClinicDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinic_id = await getClinicId(req);
        
        const document = await prisma.clinic_document.findFirst({
            where: { 
                id: parseInt(id),
                clinic_id: clinic_id
            }
        });

        if (!document || !document.file_url) {
            return ResponseHandler.notFound(res, 'Document not found');
        }

        // Redirect to Supabase URL with download disposition
        res.redirect(document.file_url);
    } catch (error) {
        next(error);
    }
};

// Delete a clinic document
exports.deleteClinicDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinic_id = await getClinicId(req);

        const doc = await prisma.clinic_document.findUnique({ 
            where: { id: parseInt(id) } 
        });
        
        if (!doc || doc.clinic_id !== clinic_id) {
            return ResponseHandler.notFound(res, 'Document not found');
        }

        // Delete from Supabase if file_url exists
        if (doc.file_url) {
            await deleteFromSupabase(doc.file_url);
        }

        await prisma.clinic_document.delete({ where: { id: parseInt(id) } });

        ResponseHandler.success(res, null, 'Clinic document deleted successfully');
    } catch (error) {
        next(error);
    }
};

// Get document types for the clinic (for filtering)
exports.getDocumentTypes = async (req, res, next) => {
    try {
        const clinic_id = await getClinicId(req);
        if (!clinic_id) return ResponseHandler.badRequest(res, 'Clinic not identified');

        const documentTypes = await prisma.clinic_document.findMany({
            where: { clinic_id },
            select: { document_type: true },
            distinct: ['document_type']
        });

        const types = documentTypes
            .map(d => d.document_type)
            .filter(Boolean);

        ResponseHandler.success(res, types, 'Document types retrieved successfully');
    } catch (error) {
        next(error);
    }
};

