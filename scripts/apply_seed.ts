// fetch is global in Node.js 24+
const API_URL = 'http://localhost:3001/api';
const API_KEY = 'secret';

async function main() {
    console.log('1. Requesting Reseed Preview...');
    const previewRes = await fetch(`${API_URL}/reseed/preview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    });

    if (!previewRes.ok) {
        console.error('Preview failed:', await previewRes.text());
        return;
    }

    const previewData = await previewRes.json();
    console.log('Preview Stats:', previewData.stats);

    if (previewData.stats.created === 0 && previewData.stats.updated === 0) {
        console.log('No changes to apply.');
        return;
    }

    console.log('2. Applying Changes...');
    const applyRes = await fetch(`${API_URL}/reseed/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        },
        body: JSON.stringify({ ops: previewData.ops })
    });

    if (!applyRes.ok) {
        console.error('Apply failed:', await applyRes.text());
        return;
    }

    const applyResult = await applyRes.json();
    console.log('Apply Result:', applyResult);
}

main().catch(console.error);
