import type { Entity } from '../../../lib/api';
import type { RecordCardConfig } from '../config/studio-config';
import { RecordCardDynamic } from './RecordCardDynamic';
import { RecordRelatedList } from './RecordRelatedList';
import { RecordCardAlgo3 } from './RecordCardAlgo3';

interface RecordCardGridProps {
    cards: RecordCardConfig[];
    entity: Entity;
    definition?: Entity;
    isEditing?: boolean;
    onChange?: (field: string, value: any) => void;
}

export function RecordCardGrid({ cards, entity, definition, isEditing, onChange }: RecordCardGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((cardConfig) => {
                    if (cardConfig.type === 'relation') {
                        return <RecordRelatedList key={cardConfig.id} config={cardConfig} parentRecord={entity} />;
                    }

                    if (cardConfig.type === 'algo3') {
                        return <RecordCardAlgo3 key={cardConfig.id} config={cardConfig} parentRecord={entity} />;
                    }
                    
                    return (
                    <RecordCardDynamic 
                        key={cardConfig.id} 
                        config={cardConfig} 
                        entity={entity} 
                        definition={definition}
                        isEditing={isEditing}
                        onChange={onChange}
                    />
                    );
            })}
        </div>
    );
}
