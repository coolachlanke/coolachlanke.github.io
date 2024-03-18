function generatePDF() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const data = results.data;
                let newcomers = data//.filter(row => row['WCA ID'] === ''); // Filter out the returning competitors

                // Remove local names in parentheses from the 'Name' field
                // and sort by name alphabetically
                newcomers = newcomers.map(row => {
                    if (row['Name']) {
                        row['Name'] = row['Name'].replace(/\s*\(.*?\)\s*/g, '');
                    }
                    return row;
                }).sort((a, b) => {
                    // Ensure the names are defined and compare them
                    if (a['Name'] && b['Name']) {
                        return a['Name'].localeCompare(b['Name']);
                    }
                    return 0;
                });
                createPDF(newcomers); // Create the output newcomer list pdf with jsPDF
            }
        });
    }
}

function createPDF(newcomers) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    // Column names, which will appear as headers of the table
    const columns = [['Name'], ['Country'], ['Birth Date'], ['Gender'], ['Check']];

    // SCA and WCA logo images
    const scaLogoUrl = '/images/sca_logo.png';
    const wcaLogoUrl = '/images/wca_logo.png';
    doc.addImage(scaLogoUrl, 'PNG', 10, 10, 40, 20);
    doc.addImage(wcaLogoUrl, 'PNG', pageWidth - 40, 10, 20, 20);

    // Add the 'NEWCOMERS' title centered at the top
    doc.setFontSize(30); // Set the font size for the title
    doc.text('NEWCOMERS', pageWidth/2, 30, 'center'); // 'center' aligns the text in the middle of the page width

    doc.autoTable({
        startY: 40,
        head: [columns],
        body: newcomers.map(item => [item['Name'], item['Country'], item['Birth Date'], item['Gender'], '']),
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 },
            3: { cellWidth: 20 }, 
            4: { cellWidth: 20 }
        },
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
        margin: { top: 10 },
        theme: 'grid'
    });

    // Save the PDF
    doc.save('newcomers.pdf');
}
