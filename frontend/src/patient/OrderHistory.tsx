import { useState, useEffect } from 'react';
import {
    History,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    ChevronRight,
    MapPin,
    Calendar,
    Pill
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Badge } from '../common/ui/badge';
import { medicineService } from '../services/medicineService';
import type { PatientUser } from './PatientPortal';

export function OrderHistory({ patient: _patient }: { patient: PatientUser }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await medicineService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <CheckCircle2 className="size-4" />;
            case 'shipped': return <Truck className="size-4" />;
            case 'pending': return <Clock className="size-4" />;
            default: return <Package className="size-4" />;
        }
    };

    if (loading) {
        return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div></div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <p className="text-sm text-gray-600">Track and manage your medicine orders</p>
                </div>
                <Button variant="outline" onClick={fetchOrders}>
                    Refresh
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-pink-100">
                    <CardContent className="space-y-4">
                        <History className="size-16 text-pink-200 mx-auto" />
                        <h2 className="text-xl font-medium text-gray-900">No orders found</h2>
                        <p className="text-gray-500">You haven't placed any medicine orders yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden border-pink-50 hover:border-pink-200 transition-colors shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b border-pink-50 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</p>
                                            <p className="text-sm font-bold text-gray-900">#ORD-{order.id.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Placed On</p>
                                            <p className="text-sm font-semibold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</p>
                                            <p className="text-sm font-bold text-pink-600">₹{order.total_amount}</p>
                                        </div>
                                    </div>
                                    <Badge className={`flex items-center gap-1.5 px-3 py-1 border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status?.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Pill className="size-4 text-pink-600" />
                                            Medicines ({order.order_items?.length || 0})
                                        </h4>
                                        <div className="space-y-3">
                                            {order.order_items?.map((item: any) => (
                                                <div key={item.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700">{item.medicine?.medicine_name} <span className="text-gray-400">x{item.quantity}</span></span>
                                                    <span className="font-medium text-gray-900">₹{item.price_at_order * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-l border-pink-50 pl-6">
                                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Truck className="size-4 text-purple-600" />
                                            Delivery Status
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="size-4 text-gray-400 mt-0.5" />
                                                <p className="text-gray-600 line-clamp-2">{order.delivery_address || 'No address provided'}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="size-4 text-gray-400" />
                                                <p className="text-gray-600">Last updated: {new Date(order.updated_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button variant="link" className="p-0 h-auto text-pink-600 font-bold text-xs" onClick={() => { }}>
                                            Track Order Status <ChevronRight className="size-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
