export async function includeComponent(id, file) {
    try {
        const response = await fetch(file);
        if (!response.ok)
            throw new Error(`Errore nel caricamento di ${file}`);
        
        const content = await response.text();
        document.getElementById(id).innerHTML = content;

        if (id === "navbar") {
            const initial = location.hash?.replace(/^#/, '') || 'index.html';
            loadPage(initial);
        }
    } catch (err) {
        console.error(err);
    }
}