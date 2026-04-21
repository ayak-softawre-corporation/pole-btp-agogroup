const fs = require('fs');
const path = require('path');

// Dossier contenant les images
const imagesDir = path.join(__dirname, 'assets', 'images');
// Fichier de sortie
const outputFile = path.join(__dirname, 'photos-list.json');

// Extensions d'images reconnues
const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

try {
    // Lire tous les fichiers du dossier
    const files = fs.readdirSync(imagesDir);

    // Filtrer pour ne garder que les images
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext);
    });

    // Pour chaque image, récupérer sa date de modification et construire un titre
    const photosWithDate = imageFiles.map(filename => {
        const filePath = path.join(imagesDir, filename);
        const stats = fs.statSync(filePath);
        const mtime = stats.mtime; // Date de modification

        // Nettoyer le nom du fichier pour en faire un titre
        const nameWithoutExt = path.basename(filename, path.extname(filename));
        // Remplacer les séparateurs par des espaces et supprimer "(1)", "(2)", etc.
        let cleanTitle = nameWithoutExt
            .replace(/[_-]/g, ' ')
            .replace(/\(\d+\)/g, '')
            .trim();

        // Si le titre devient vide, utiliser un titre par défaut
        if (!cleanTitle) cleanTitle = 'Photo de chantier';

        return {
            src: `assets/images/${filename}`,
            title: cleanTitle,
            alt: `Photo de chantier - ${cleanTitle}`,
            mtime: mtime.getTime() // pour le tri
        };
    });

    // Trier par date décroissante (plus récent d'abord)
    photosWithDate.sort((a, b) => b.mtime - a.mtime);

    // Supprimer le champ 'mtime' avant d'écrire le JSON
    const finalPhotos = photosWithDate.map(({ src, title, alt }) => ({ src, title, alt }));

    // Écrire le fichier JSON
    fs.writeFileSync(outputFile, JSON.stringify(finalPhotos, null, 2), 'utf8');

    console.log(`✅ photos-list.json généré avec ${finalPhotos.length} photos (triées par date de modification).`);
} catch (err) {
    console.error('❌ Erreur : dossier assets/images introuvable ou inaccessible.');
    console.error(err.message);
}