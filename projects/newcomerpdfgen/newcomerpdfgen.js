// Load Oswald font
// const oswaldFont = {
//     src: 'oswald.ttf', // Replace '/path/to/oswald.ttf' with the actual path or URL to your Oswald font file
//     family: 'Oswald'
// };

function hidePDFViewer() {
    document.getElementById('pdfResult').style.display = 'none';
}

function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoadingIndicator() {
    setTimeout(function() {
        document.getElementById('loadingIndicator').style.display = 'none';
    }, 500); // Delay hiding the loading indicator for 500ms
}

function showPDFViewer() {
    setTimeout(function() {
        document.getElementById('pdfResult').style.display = 'block';
    }, 500); // Delay showing the PDF viewer for 500ms
}

function generatePDF() {
    hidePDFViewer(); // Hide the PDF viewer if it's already visible
    showLoadingIndicator();

    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    // Check if a valid file is uploaded before generating PDF
    if (file && file.name.toLowerCase().endsWith('.csv')) {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                const data = results.data;
                let newcomers = data.filter(row => row['WCA ID'] === ''); // Filter out the returning competitors
                newcomers = newcomers.filter(row => row['Name'] && row['Country'] && row['Birth Date'] && row['Gender']);

                // Remove local names in parentheses from the 'Name' field and sort by name alphabetically
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
                hideLoadingIndicator();
                showPDFViewer();
            }
        });
    } else {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'block';
    }
}

function isValidWCAName(name) {
    // Check if name has at least two words
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
        return false;
    }

    for (const word of words) {
        // Check if each word starts with a capital letter, ignoring hyphens
        if (!/^[A-Z][a-zA-Z]*$/.test(word.replace(/-/g, ''))) {
            return false;
        }
    }

    return true;
}

function createPDF(newcomers) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4'
    });

    // Load Oswald font
    console.log("got");
    doc.addFileToVFS('oswald.ttf', 'oswald');
    console.log("he");
    doc.addFont('oswald.ttf', 'oswald', 'normal');
    console.log("re");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Column names, which will appear as headers of the table
    const columns = [['Name'], ['Country'], ['Birth Date'], ['Gender'], ['Check']];

    // SCA and WCA logo images
    const scaLogoUrl = '/images/sca_logo.png';
    const wcaLogoUrl = '/images/wca_logo.png';
    doc.addImage(scaLogoUrl, 'PNG', 10, 10, 40, 20);
    doc.addImage(wcaLogoUrl, 'PNG', pageWidth - 40, 10, 20, 20);

    // Add the 'NEWCOMERS' title centered at the top
    doc.setFont('courier');
    doc.setFontSize(40);
    doc.text('NEWCOMERS', pageWidth/2, 30, 'center');

    doc.autoTable({
        startY: 40,
        head: [columns],
        body: newcomers.map(item => [item['Name'], item['Country'], item['Birth Date'], item['Gender'], '']),
        didParseCell: function(data) {
            // Check if we're in the body section and in the 'Name' column
            if (data.row.section === 'body' && data.column.dataKey === 0 && !isValidWCAName(data.cell.raw)) {
                data.cell.styles.fillColor = [173, 216, 230]; // Pastel blue
            }
            // Check if we're in the body section and in the 'Country' column
            if (data.row.section === 'body' && data.column.dataKey === 1 && data.cell.raw !== 'Australia') {
                data.cell.styles.fillColor = [217, 178, 250]; // Pastel pink
            }
        },
        columnStyles: {
            0: { cellWidth: 70, lineWidth: 0.3, lineColor: [0, 0, 0] },
            1: { cellWidth: 40, lineWidth: 0.3, lineColor: [0, 0, 0] },
            2: { cellWidth: 30, lineWidth: 0.3, lineColor: [0, 0, 0] },
            3: { cellWidth: 20, lineWidth: 0.3, lineColor: [0, 0, 0] },
            4: { cellWidth: 20, lineWidth: 0.3, lineColor: [0, 0, 0] }
        },
        styles: { font: 'helvetica', fontSize: 10, lineWidth: 0.3, lineColor: [0, 0, 0], textColor: [0, 0, 0] }, // Black text color for body cells
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], lineWidth: 0.3, lineColor: [0, 0, 0] },
        margin: { top: 10 , bottom: 20},
        theme: 'grid'
    });

    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, 'center');
    }

    const pdfBlob = doc.output('blob');

    // Display the PDF in the iframe
    const pdfUrl = URL.createObjectURL(pdfBlob);
    document.getElementById('pdfViewer').src = pdfUrl;

    // Save the PDF --> user can do it for themself via the iframe
    // doc.save('newcomers_checkin_list.pdf');
}
