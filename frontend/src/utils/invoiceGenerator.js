import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order) => {
    // 1. Create a new PDF document (A4 size, portrait)
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Brand color (unchanged)
    const brandColor = [219, 39, 119]; // Pink
    const lightBrandTint = [253, 242, 248]; // Very light pink tint (derived from brand color, used only as bg)

    // 2. Header band (light pink background strip)
    doc.setFillColor(...lightBrandTint);
    doc.rect(0, 0, pageWidth, 42, "F");

    // Company details (left)
    doc.setFontSize(24);
    doc.setTextColor(...brandColor);
    doc.setFont("helvetica", "bold");
    doc.text("EKART", 14, 20);

    doc.setFontSize(9.5);
    doc.setTextColor(110);
    doc.setFont("helvetica", "normal");
    doc.text("Tax Invoice / Bill of Supply", 14, 27);
    doc.text("support@ekart.com  |  www.ekart.com", 14, 32.5);

    // Invoice details (right)
    doc.setFontSize(16);
    doc.setTextColor(50);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 14, 18, { align: "right" });

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90);
    doc.text(`Order ID: ${order.id}`, pageWidth - 14, 25, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageWidth - 14, 30.5, { align: "right" });

    // Status pill (top right)
    const statusText = String(order.status || "").toUpperCase();
    doc.setFontSize(8.5);
    const statusWidth = doc.getTextWidth(statusText) + 10;
    doc.setFillColor(...brandColor);
    doc.roundedRect(pageWidth - 14 - statusWidth, 34, statusWidth, 6.5, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text(statusText, pageWidth - 14 - statusWidth / 2, 38.4, { align: "center" });

    // Divider under header band
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.6);
    doc.line(0, 42, pageWidth, 42);

    // 3. Bill To Section (boxed)
    doc.setDrawColor(230);
    doc.setLineWidth(0.2);
    doc.roundedRect(14, 50, pageWidth - 28, 22, 2, 2, "S");

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("BILL TO", 19, 57.5);

    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(order.user?.name || "Customer", 19, 64);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(order.user?.email || "N/A", 19, 69);

    // 4. Products Table using jspdf-autotable
    const tableColumn = ["S.No", "Product Name", "Product ID", "Qty", "Price", "Total"];
    const tableRows = [];

    order.products.forEach((product, index) => {
        const productData = [
            index + 1,
            product.productName.substring(0, 40) + (product.productName.length > 40 ? "..." : ""),
            product.productId.substring(0, 8) + "...",
            product.quantity,
            `Rs. ${product.price.toFixed(2)}`,
            `Rs. ${(product.price * product.quantity).toFixed(2)}`
        ];
        tableRows.push(productData);
    });

    autoTable(doc, {
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        styles: {
            fontSize: 9.5,
            cellPadding: 4,
            lineColor: [235, 235, 235],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: brandColor,
            textColor: 255,
            halign: 'center',
            fontStyle: 'bold',
            fontSize: 9.5,
        },
        alternateRowStyles: { fillColor: lightBrandTint },
        bodyStyles: { textColor: 50 },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 25 },
            5: { halign: 'right', cellWidth: 30 },
        },
    });

    // 5. Footer calculations
    let finalY = doc.lastAutoTable.finalY || 80;

    const tax = order.tax || 0;
    const shipping = order.shipping || 0;
    const subtotal = order.amount - tax - shipping;

    // Ensure summary block fits on page, else add new page
    if (finalY + 55 > pageHeight) {
        doc.addPage();
        finalY = 20;
    }

    const summaryX = pageWidth - 80;
    const summaryWidth = 66;

    doc.setDrawColor(230);
    doc.setLineWidth(0.2);
    doc.roundedRect(summaryX, finalY + 6, summaryWidth, 34, 2, 2, "S");

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90);

    doc.text("Subtotal", summaryX + 5, finalY + 14);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 19, finalY + 14, { align: "right" });

    doc.text("Tax", summaryX + 5, finalY + 21);
    doc.text(`Rs. ${tax.toFixed(2)}`, pageWidth - 19, finalY + 21, { align: "right" });

    doc.text("Shipping", summaryX + 5, finalY + 28);
    doc.text(`Rs. ${shipping.toFixed(2)}`, pageWidth - 19, finalY + 28, { align: "right" });

    // Grand total highlighted band
    doc.setFillColor(...brandColor);
    doc.roundedRect(summaryX, finalY + 32, summaryWidth, 10, 2, 2, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255);
    doc.text("Grand Total", summaryX + 5, finalY + 38.5);
    doc.text(`Rs. ${order.amount.toFixed(2)}`, pageWidth - 19, finalY + 38.5, { align: "right" });

    // 6. Footer note + page number on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(230);
        doc.setLineWidth(0.2);
        doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...brandColor);
        doc.text("Thank you for shopping with Ekart!", 14, pageHeight - 11);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 11, { align: "right" });
    }

    // 7. Save the PDF
    doc.save(`Ekart_Invoice_${order.id.substring(0, 8)}.pdf`);
};