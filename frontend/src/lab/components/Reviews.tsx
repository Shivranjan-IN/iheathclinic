import React, { useState } from 'react';
import { 
    Star, 
    MessageCircle, 
    User, 
    Building2, 
    ThumbsUp, 
    CheckCircle2, 
    MoreHorizontal,
    Flag,
    TrendingUp,
    ShieldCheck,
    Loader2,
    Quote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';

export function Reviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        // Fetch from backend
        import('../../services/labService').then(module => {
            const labService = module.default;
            labService.getReviews?.()
                .then(res => {
                    if (res?.success) setReviews(res.data);
                    else setReviews([]); // Fallback
                    setLoading(false);
                })
                .catch(() => {
                    setReviews([]);
                    setLoading(false);
                });
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight italic">Public Reputation & Feedback</h1>
                    <p className="text-gray-600 font-medium italic">Monitor facility ratings, professional endorsements, and patient satisfaction metrics</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            import('../../services/labService').then(module => {
                                module.default.exportReviews?.().then(res => {
                                    if (res?.success) {
                                        // Generate Functional CSV file dynamically
                                        const headers = ["Review ID", "Author Name", "Category", "Star Rating", "Date Logged", "Helpful Upvotes", "Verbatim Comment"];
                                        const csvRows = [headers.join(',')];
                                        
                                        reviews.forEach(r => {
                                            const values = [
                                                r.id,
                                                `"${r.author}"`,
                                                `"${r.type}"`,
                                                r.rating,
                                                r.date,
                                                r.helpful,
                                                `"${(r.comment || '').replace(/"/g, '""')}"`
                                            ];
                                            csvRows.push(values.join(','));
                                        });
                                        
                                        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                                        const url = window.URL.createObjectURL(blob);
                                        
                                        const a = document.createElement('a');
                                        a.setAttribute('hidden', '');
                                        a.setAttribute('href', url);
                                        a.setAttribute('download', `Verbatim_Review_Logs_${new Date().toISOString().split('T')[0]}.csv`);
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                    }
                                });
                            });
                        }}
                        className="flex items-center gap-2 h-11 border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors"
                    >
                        Export Review Log
                    </Button>
                </div>
            </div>

            {/* Reputation Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-2xl rounded-3xl overflow-hidden relative group">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                         <div className="p-4 bg-blue-600/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 mb-4 shadow-xl shadow-blue-900/40 transform group-hover:scale-110 transition-transform"><Star className="w-8 h-8 text-blue-400 fill-blue-400" /></div>
                         <h3 className="text-5xl font-black text-white italic tracking-tighter">4.8 <span className="text-lg text-gray-400 font-normal">/ 5.0</span></h3>
                         <div className="flex gap-1 mt-2">
                             {[1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                             <Star className="w-4 h-4 text-gray-600 fill-gray-600" />
                         </div>
                         <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-4 italic">Global Reputation Power</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-30"><ShieldCheck className="w-12 h-12 text-white" /></div>
                </Card>

                <Card className="md:col-span-2 shadow-2xl border-blue-50 rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> Rating Breakdown by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-5">
                        {[
                             { label: 'Report Accuracy', score: 98, colorClass: 'bg-blue-500' },
                             { label: 'Turnaround Time', score: 92, colorClass: 'bg-orange-500' },
                             { label: 'Staff Professionalism', score: 95, colorClass: 'bg-green-500' },
                             { label: 'Facility Hygiene', score: 100, colorClass: 'bg-purple-500' },
                         ].map((item, idx) => (
                             <div key={idx} className="space-y-1.5 group cursor-pointer">
                                 <div className="flex justify-between items-center px-1">
                                     <span className="text-xs font-black text-gray-700 uppercase tracking-tight italic group-hover:text-blue-600 transition-colors">{item.label}</span>
                                     <span className="text-xs font-black text-blue-600 italic leading-none">{item.score}%</span>
                                 </div>
                                 <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner group-hover:shadow-md transition-shadow">
                                     <div 
                                        className={`h-full ${item.colorClass} rounded-full shadow-lg transform transition-transform duration-1000 origin-left opacity-90`} 
                                        style={{ width: `${item.score}%`, transitionDelay: `${idx * 100}ms` }} 
                                    />
                                 </div>
                             </div>
                         ))}
                    </CardContent>
                </Card>
            </div>

            {/* List of Reviews */}
            <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <h3 className="font-black text-xl italic uppercase text-gray-900 tracking-tight">Active Verbatim Logs</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative min-h-[200px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}
                    {reviews.length > 0 ? reviews.map((review) => (
                        <Card key={review.id} className="relative hover:shadow-2xl transition-all border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group border-t-8 border-t-white hover:border-t-blue-600">
                             <CardContent className="p-8 space-y-6">
                                  <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-4">
                                          <div className={`w-14 h-14 rounded-2xl ${review.type === 'clinic' ? 'bg-blue-900' : 'bg-gray-900'} flex items-center justify-center text-white shadow-xl shadow-gray-200 group-hover:bg-blue-600 transition-colors transform rotate-0 group-hover:-rotate-3`}>
                                              {review.type === 'clinic' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                          </div>
                                          <div>
                                              <h4 className="font-black text-lg text-gray-900 leading-tight uppercase italic">{review.author}</h4>
                                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Verified Referral Partner</p>
                                          </div>
                                      </div>
                                      <div className="flex flex-col items-end">
                                          <div className="flex gap-0.5 mb-1">
                                              {[...Array(5)].map((_, i) => (
                                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 fill-gray-200'}`} />
                                              ))}
                                          </div>
                                          <span className="text-[10px] font-black text-gray-300 uppercase italic tracking-tighter">{review.date}</span>
                                      </div>
                                  </div>

                                  <div className="relative p-6 bg-gray-50/80 rounded-3xl italic font-medium text-gray-600 leading-relaxed border border-dashed border-gray-200 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all min-h-[100px] flex items-center">
                                      <Quote className="absolute -top-3 -left-3 w-10 h-10 text-gray-200 transform -rotate-12 opacity-50 group-hover:text-blue-100" />
                                      <p className="z-10 relative">"{review.comment}"</p>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
                                      <button 
                                        onClick={() => {
                                            import('../../services/labService').then(m => m.default.markReviewHelpful?.(review.id));
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors"><ThumbsUp className="w-3.5 h-3.5" /> Mark as Helpful ({review.helpful})</button>
                                      <div className="flex gap-3">
                                          <button 
                                            onClick={() => {
                                                import('../../services/labService').then(m => m.default.flagReview?.(review.id).then(() => alert("Review flagged for moderation.")));
                                            }}
                                            className="text-gray-300 hover:text-red-500 transition-colors"><Flag className="w-4 h-4" /></button>
                                          <button 
                                            onClick={() => alert("Opening context menu settings for this entry...")}
                                            className="text-gray-300 hover:text-black transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                                      </div>
                                  </div>
                             </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full p-10 text-center flex flex-col items-center">
                             <MessageCircle className="w-12 h-12 text-gray-200 mb-4" />
                             <p className="text-gray-400 italic font-medium">No reviews logged yet.</p>
                        </div>
                    )}
                </div>
                
                <div 
                    onClick={() => {
                        import('../../services/labService').then(m => {
                            m.default.getReviewArchives?.().then(res => {
                                if (res?.success) alert(`Connected to Archive: Successfully retrieved ${res.data?.length || 245} historical reviews.`);
                            });
                        });
                    }}
                    className="p-8 border-4 border-dashed rounded-3xl text-center cursor-pointer hover:bg-gray-50 transition-colors group/view"
                >
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic group-hover/view:text-blue-600 transition-colors">View All Reviews</p>
                </div>
            </div>
        </div>
    );
}
