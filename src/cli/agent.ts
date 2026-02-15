
import { readEntityTool, updateEntityFieldTool, rewriteContentTool } from '../core/agent/tools.js';
import { createEntity } from '../core/entities.js';

const cmd = process.argv[2];
const args = process.argv.slice(3);

async function main() {
    try {
        switch (cmd) {
            case 'create':
                const [type, slug, name] = args;
                const newEntity = createEntity({ type: type as any, slug, name });
                console.log(JSON.stringify(newEntity, null, 2));
                break;
            
            case 'read':
                const [idOrSlug] = args;
                const entity = readEntityTool(idOrSlug);
                console.log(JSON.stringify(entity, null, 2));
                break;

            case 'update':
                const [uId, uField, uValue] = args;
                const uResult = updateEntityFieldTool(uId, uField, uValue);
                console.log(JSON.stringify(uResult, null, 2));
                break;
            
            case 'rewrite':
                const [rId, rField, rContent] = args;
                const rResult = rewriteContentTool(rId, rField, rContent);
                console.log(JSON.stringify(rResult, null, 2));
                break;

            case 'delete':
                const [dId] = args;
                // createEntity imported from entities.ts, need deleteEntity too
                const { deleteEntity } = await import('../core/entities.js');
                const dResult = deleteEntity(dId);
                console.log(`Deleted ${dId}: ${dResult}`);
                break;

            default:
                console.log("Usage: create|read|update|rewrite ...");
        }
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
