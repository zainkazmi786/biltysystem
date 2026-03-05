export {};

declare global {
  interface Window {
    jsPDF: typeof import('jspdf');
    jspdfAutoTable: typeof import('jspdf-autotable');
  }
}