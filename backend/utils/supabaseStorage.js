
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucketName = process.env.SUPABASE_BUCKET || 'clinic-files';

// Validate Supabase configuration
if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not configured. File uploads will fail.');
}

const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

// Cache for bucket name lookup
let actualBucketName = null;

/**
 * Get the actual bucket name (case-insensitive lookup)
 * @returns {Promise<string|null>} - The actual bucket name or null
 */
async function getActualBucketName() {
    if (actualBucketName) return actualBucketName;
    
    if (!supabase) return null;
    
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error || !buckets) return supabaseBucketName;
        
        // First try exact match
        let bucket = buckets.find(b => b.name === supabaseBucketName);
        
        // If not found, try case-insensitive match
        if (!bucket) {
            bucket = buckets.find(b => b.name.toLowerCase() === supabaseBucketName.toLowerCase());
        }
        
        actualBucketName = bucket ? bucket.name : supabaseBucketName;
        console.log(`🔍 Bucket lookup: requested="${supabaseBucketName}", actual="${actualBucketName}"`);
        
        return actualBucketName;
    } catch (error) {
        console.error('Error looking up bucket:', error);
        return supabaseBucketName;
    }
}

/**
 * Upload file to Supabase Storage bucket
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original filename
 * @param {string} folder - Folder name in bucket (e.g., 'patients', 'doctors', 'documents')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
const uploadToSupabase = async (fileBuffer, fileName, folder = 'files') => {
    if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        // Create a 10 second timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Supabase request timed out after 10 seconds'));
            }, 10000);
        });

        // The actual upload logic
        const uploadTask = async () => {
            // Get the actual bucket name (handles case-insensitive lookup)
            const bucketName = await getActualBucketName();
            
            // Generate unique filename with timestamp
            const timestamp = Date.now();
            const randomNum = Math.floor(Math.random() * 1000000);
            const extension = fileName.split('.').pop();
            const newFileName = `${folder}/${timestamp}-${randomNum}.${extension}`;

            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(newFileName, fileBuffer, {
                    contentType: getMimeType(extension),
                    upsert: false
                });

            if (error) {
                throw new Error(error.message);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(newFileName);

            return { 
                success: true, 
                url: urlData.publicUrl 
            };
        };

        // Race the upload against the timeout
        return await Promise.race([uploadTask(), timeoutPromise]);
    } catch (error) {
        console.error('Supabase upload exception:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete file from Supabase Storage bucket
 * @param {string} fileUrl - The file URL or path to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const deleteFromSupabase = async (fileUrl) => {
    if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        // Get the actual bucket name
        const bucketName = await getActualBucketName();
        
        // Extract file path from URL
        const urlParts = fileUrl.split('/storage/v1/object/public/');
        const filePath = urlParts.length > 1 ? urlParts[1] : fileUrl;

        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Supabase delete exception:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} - MIME type
 */
const getMimeType = (extension) => {
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

module.exports = {
    supabase,
    uploadToSupabase,
    deleteFromSupabase,
    getMimeType,
    getActualBucketName
};

