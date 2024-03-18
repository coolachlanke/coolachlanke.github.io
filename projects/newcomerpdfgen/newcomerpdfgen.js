function generatePDF() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const data = results.data;
                const newcomers = data.filter(row => row['WCA ID'] === ''); // Adjust based on your CSV structure
                createPDF(newcomers);
            }
        });
    }
}

function createPDF(newcomers) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Example PDF generation (customize as needed)
    doc.setFontSize(22);
    doc.text('Newcomers', 20, 20);

    newcomers.forEach((newcomer, index) => {
        const y = 30 + (10 * index);
        doc.setFontSize(16);
        doc.text(`${newcomer.Name} (${newcomer.Country})`, 20, y);
    });

    // Save the PDF
    doc.save('newcomers.pdf');
}
