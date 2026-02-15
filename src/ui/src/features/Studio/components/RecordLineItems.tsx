
import type { Entity } from '../../../lib/api';
import { api } from '../../../lib/api';
import { Trash2, Plus, Minus } from 'lucide-react';

interface LineItem {
    id: string;
    product_id: string;
    name: string;
    sku: string;
    price: number;
    currency: string;
    quantity: number;
}

interface RecordLineItemsProps {
    record: Entity;
    onUpdate?: () => void;
}

export function RecordLineItems({ record, onUpdate }: RecordLineItemsProps) {
    // const { api } = useAPI(); // Removed as per instruction
    // const [isAdding, setIsAdding] = useState(false); // Unused
    
    // Cast to any to access line_items until EntityData is typed
    const data = record.data as any;
    const items: LineItem[] = (data?.line_items as LineItem[]) || [];
    
    // Calculate total from items, fallback to record.data.amount if strict match
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currency = data?.currency || 'USD';

    const handleRemove = async (itemId: string) => {
        if (!confirm('Remove this item?')) return;
        try {
            // We use the commercial API route
            await api.removeOpportunityItem(record.id, itemId);
            onUpdate?.();
        } catch (e) {
            console.error('Failed to remove item', e);
            alert('Failed to remove item');
        }
    };

    const handleUpdateQuantity = async (itemId: string, newQty: number) => {
        if (newQty < 0) return;
        try {
            await api.updateOpportunityItemQuantity(record.id, itemId, newQty);
            onUpdate?.();
        } catch (e) {
            console.error('Failed to update quantity', e);
        }
    };

    const handleAddProduct = () => {
        // In a real implementation, this would open a RecordPicker modal
        // For now, we'll simulate adding a product for demonstration or implement a simple prompt
        const productId = prompt("Enter Product ID to add (Debug):"); 
        if (productId) {
            api.addOpportunityItem(record.id, productId, 1)
               .then(() => onUpdate?.())
               .catch((e: Error) => alert('Failed to add: ' + e.message));
        }
    };

    return (
        <div className="space-y-4">
            {/* Header / Summary */}
            <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Value</div>
                    <div className="text-2xl font-mono text-emerald-400">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(total)}
                    </div>
                </div>
                <button 
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded transition-colors"
                >
                    <Plus size={14} />
                    Add Product
                </button>
            </div>

            {/* List */}
            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-center py-8 text-zinc-600 text-sm italic border border-dashed border-zinc-800 rounded">
                        No line items. Add products to build a quote.
                    </div>
                )}
                
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded hover:border-zinc-700 transition-colors group">
                        <div className="flex-1">
                            <div className="font-medium text-zinc-200">{item.name}</div>
                            <div className="text-xs text-zinc-500 font-mono">{item.sku}</div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {/* Price */}
                            <div className="text-right w-24">
                                <div className="text-sm text-zinc-300">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price)}
                                </div>
                                <div className="text-[10px] text-zinc-600">unit price</div>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-2 bg-zinc-950 rounded border border-zinc-800 px-1">
                                <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 text-zinc-500 hover:text-zinc-300"
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-sm font-mono text-zinc-300">{item.quantity}</span>
                                <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 text-zinc-500 hover:text-zinc-300"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            {/* Total */}
                            <div className="text-right w-24 font-mono text-zinc-200">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price * item.quantity)}
                            </div>

                            {/* Actions */}
                            <button 
                                onClick={() => handleRemove(item.id)}
                                className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Item"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
