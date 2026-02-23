import jsPDF from "jspdf";
import { SavedBet } from "./bets";

export function exportBetsToPDF(bets: SavedBet[]) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Loto Prêmio Pro - Minhas Apostas", 14, 20);

    doc.setFontSize(12);
    doc.text(`Data de Exportação: ${new Date().toLocaleDateString()}`, 14, 30);

    let y = 40;

    bets.forEach((bet) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`${bet.name} (${bet.lottery.toUpperCase()})`, 14, y);

        doc.setFont("helvetica", "normal");
        doc.text(`Data: ${new Date(bet.date).toLocaleDateString()}`, 14, y + 6);
        doc.text(`Números: ${bet.numbers.join(", ")}`, 14, y + 12);

        y += 24;
    });

    doc.save("minhas-apostas.pdf");
}
