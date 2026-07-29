import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// Same "Hotel vs Transport" display logic already used in DashboardTrips.jsx —
// kept here too so the export matches what the user sees on screen.
const bookingLabel = (b) =>
  b.booking_type === 'Hotel'
    ? b.hotel_name || 'Hotel'
    : `${b.company_name || 'Transport'} (${b.vehicle_type || ''})`;

// jsPDF's default font (Helvetica) doesn't have the "→" glyph, so it renders
// as garbage in the PDF. Use a plain ASCII arrow there instead.
const bookingRoutePdf = (b) =>
  b.booking_type === 'Hotel'
    ? b.hotel_location || '-'
    : `${b.source || '-'} -> ${b.destination || '-'}`;

// CSV opens fine in Excel/Sheets with the real arrow, so keep it nice there.
const bookingRouteCsv = (b) =>
  b.booking_type === 'Hotel'
    ? b.hotel_location || '-'
    : `${b.source || '-'} → ${b.destination || '-'}`;

export function exportBookingsToPDF(bookings, { travelerName = '', reportLabel = 'Traveler' } = {}) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Booking History', 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${reportLabel}: ${travelerName || '-'}`, 14, 25);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  const rows = bookings.map((b) => [
    b.booking_type,
    bookingLabel(b),
    bookingRoutePdf(b),
    b.travel_date,
    b.status,
    `Tk ${Number(b.total_price).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['Type', 'Details', 'Location / Route', 'Travel Date', 'Status', 'Price']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] }, // matches --color-primary
  });

  doc.save(`booking-history-${Date.now()}.pdf`);
}

export function exportBookingsToCSV(bookings) {
  const rows = bookings.map((b) => ({
    'Booking ID': b.booking_id,
    'Type': b.booking_type,
    'Details': bookingLabel(b),
    'Location / Route': bookingRouteCsv(b),
    'Travel Date': b.travel_date,
    'Booked On': b.booking_date,
    'Status': b.status,
    'Price (BDT)': b.total_price,
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `booking-history-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// jsPDF's default font doesn't have "৳", so PDFs use "Tk" like the booking
// export above already does.
export function exportItineraryToPDF(itinerary, { travelerName = '' } = {}) {
  if (!itinerary) return;
  const doc = new jsPDF();
  let y = 18;

  doc.setFontSize(18);
  doc.text(`Travel Itinerary — ${itinerary.destination || ''}`, 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `${itinerary.days || 0} day(s) · Budget: Tk ${Number(itinerary.budget || 0).toFixed(2)} · Style: ${itinerary.style || '-'}`,
    14, y
  );
  y += 5;
  if (itinerary.preferences?.length) {
    doc.text(`Preferences: ${itinerary.preferences.join(', ')}`, 14, y);
    y += 5;
  }
  doc.text(`Prepared for: ${travelerName || '-'} · Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 8;
  doc.setTextColor(0);

  (itinerary.day_plans || []).forEach((d) => {
    if (y > 260) { doc.addPage(); y = 18; }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(d.title || `Day ${d.day}`, 14, y);
    doc.setFont(undefined, 'normal');
    y += 6;

    doc.setFontSize(10);
    const rows = [
      ['Morning', d.morning || '-'],
      ['Afternoon', d.afternoon || '-'],
      ['Evening', d.evening || '-'],
      ['Accommodation', d.accommodation || '-'],
      ['Estimated cost', `Tk ${Number(d.estimated_cost || 0).toFixed(2)}`],
    ];
    rows.forEach(([label, value]) => {
      const lines = doc.splitTextToSize(`${label}: ${value}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });
    y += 4;
  });

  if (itinerary.budget_breakdown) {
    if (y > 240) { doc.addPage(); y = 18; }
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Budget Breakdown', 14, y);
    doc.setFont(undefined, 'normal');
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount (Tk)']],
      body: Object.entries(itinerary.budget_breakdown).map(([k, v]) => [
        k.charAt(0).toUpperCase() + k.slice(1),
        Number(v).toFixed(2),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (itinerary.tips?.length) {
    if (y > 250) { doc.addPage(); y = 18; }
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Tips', 14, y);
    doc.setFont(undefined, 'normal');
    y += 6;
    doc.setFontSize(10);
    itinerary.tips.forEach((tip) => {
      const lines = doc.splitTextToSize(`• ${tip}`, 180);
      doc.text(lines, 14, y);
      y += lines.length * 5;
    });
  }

  doc.save(`itinerary-${(itinerary.destination || 'trip').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
}