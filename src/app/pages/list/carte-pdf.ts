import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { formatPrice, formatVolume } from '../../shared/format';
import { RegionGroup } from './group-wines';

const BORDEAUX: [number, number, number] = [176, 26, 48];
const TEXT: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [110, 110, 110];
const LINE: [number, number, number] = [225, 225, 225];

const MARGIN = 18;
const FOOTER_SPACE = 22;

function clean(text: string): string {
  return text.replace(/[  ]/g, ' ');
}

export function downloadCartePdf(groups: RegionGroup[]): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const today = new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' });

  let y = 24;
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...BORDEAUX);
  doc.text('LES AMIS DU BON BOURGOGNE', MARGIN, y, { charSpace: 1 });
  y += 11;
  doc.setFont('times', 'normal').setFontSize(28).setTextColor(...TEXT);
  doc.text('La carte des vins', MARGIN, y);
  y += 8;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...MUTED);
  doc.text(`Carte au ${today} · Prix TTC, sous réserve de disponibilité`, MARGIN, y);
  y += 5;
  doc.setDrawColor(...BORDEAUX).setLineWidth(0.6).line(MARGIN, y, MARGIN + 14, y);
  y += 10;

  for (const group of groups) {
    if (y > pageHeight - FOOTER_SPACE - 30) {
      doc.addPage();
      y = 22;
    }
    doc.setFont('times', 'normal').setFontSize(18).setTextColor(...TEXT);
    doc.text(group.region, MARGIN, y);
    doc.setDrawColor(...LINE).setLineWidth(0.3);
    doc.line(MARGIN + doc.getTextWidth(group.region) + 4, y - 1.5, pageWidth - MARGIN, y - 1.5);
    y += 6;

    for (const category of group.categories) {
      if (y > pageHeight - FOOTER_SPACE - 25) {
        doc.addPage();
        y = 22;
      }
      doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...BORDEAUX);
      doc.text(category.label.toUpperCase(), MARGIN, y + 2, { charSpace: 0.8 });

      autoTable(doc, {
        startY: y + 4,
        margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_SPACE },
        theme: 'plain',
        head: [['Vin', 'Producteur', 'Millésime', 'Format', 'Prix']],
        body: category.wines.map((wine) => [
          wine.cuvee ? `${wine.appellation}\n${wine.cuvee}` : wine.appellation,
          wine.producer,
          wine.vintage ? String(wine.vintage) : '—',
          wine.formats.map((f) => clean(formatVolume(f.volumeCl))).join('\n'),
          wine.formats.map((f) => clean(formatPrice(f.price))).join('\n'),
        ]),
        styles: { font: 'helvetica', fontSize: 9, textColor: TEXT, cellPadding: { top: 2.2, bottom: 2.2, left: 0, right: 3 }, valign: 'top' },
        headStyles: { fontSize: 6.5, fontStyle: 'bold', textColor: MUTED },
        columnStyles: {
          0: { cellWidth: 64 },
          1: { cellWidth: 46, textColor: MUTED },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', cellPadding: { top: 2.2, bottom: 2.2, left: 0, right: 0 } },
        },
        didParseCell: (data) => {
          if (data.section === 'head' && data.column.index === 4) {
            data.cell.styles.halign = 'right';
          }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            doc.setDrawColor(...LINE).setLineWidth(0.2);
            doc.line(MARGIN, data.cell.y + data.cell.height, pageWidth - MARGIN, data.cell.y + data.cell.height);
          }
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
    }
    y += 4;
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    const footerY = pageHeight - 14;
    doc.setDrawColor(...LINE).setLineWidth(0.3).line(MARGIN, footerY - 5, pageWidth - MARGIN, footerY - 5);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text('Les amis du bon Bourgogne · Route de Cornesse, 4 – 4861 Soiron · 0494/250/377 · info@amisdubonbourgogne.eu', MARGIN, footerY);
    doc.text("L'abus d'alcool est dangereux pour la santé. À consommer avec modération.", MARGIN, footerY + 4);
    doc.text(`${page} / ${pages}`, pageWidth - MARGIN, footerY, { align: 'right' });
  }

  doc.save('carte-des-vins-les-amis-du-bon-bourgogne.pdf');
}
