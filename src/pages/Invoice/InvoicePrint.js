import React, { useContext, useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";

import { FaDownload, FaPrint, FaShare } from "react-icons/fa";
import { GetInvoice } from "../../hooks/Api";
import { AuthContext } from "../../App";
import { useToast } from "../../hooks/Common";

const InvoicePrint = () => {
  const invoiceRef = useRef(null);
  const [invoiceHtml, setInvoiceHtml] = useState(null);
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();
  useEffect(() => {

    fetchList();

  }, [])

  async function fetchList() {
    setLoadingFull(true);
    try {
      setLoadingFull(false);
      const { Success, Data, Message } = await GetInvoice();
      if (Success) {
        setInvoiceHtml(Data)
      }
      else {
        showToast(Message, "error");
      }
    }
    finally {
      setLoadingFull(false);
    }
  }

  const handleDownload = async () => {
    const invoiceElement = invoiceRef.current;
    const options = {
      margin: [0, 0, 0, 0],
      filename: "invoice.pdf",
      image: { type: "png", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
    };
    await new Promise(resolve => setTimeout(resolve, 2000)); // add delay of 1 second
    html2pdf().set(options).from(invoiceElement).save();
  };


  const handleShare = () => {
    const invoiceElement = invoiceRef.current;
    // Your share logic here
  };      // height: 11.69in;
  const cssStyle = (
    <style>
      {`.invoice-print-container {
            width: 8.27in;
      
            padding: 0.5in;
            margin: 20px auto;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
            background-color: white;
          }
          .invoice-print-container .invoice-print-icons {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .invoice-print-container .invoice-print-icons button {
            background-color: #e2e2e2;
            border: none;
            padding: 8px;
            border-radius: 5px;
            cursor: pointer;
          }
          .invoice-print-container .invoice-print-icons button:hover {
            background-color: #d2d2d2;
          }
            
         `}
    </style>
  );
  function handlePrint() {
    const invoiceSection = document.querySelector("#invoiceRef");
    const invoiceHtml = invoiceSection.innerHTML;
    const printWindow = window.open("", "", "height=500,width=500");
    printWindow.document.write("<html><head><title>Invoice</title>");
    printWindow.document.write("</head><body>");
    printWindow.document.write(invoiceHtml);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  }
  return (
    <>
      {cssStyle}
      <div
        className="invoice-print-container"
        style={{ width: "8.27in", padding: "0.5in" }}

      // dangerouslySetInnerHTML={{ __html: invoiceHtml }}
      >
        <div className="invoice-print-icons">
          <button className="btn" onClick={handleDownload}>
            <FaDownload className="icon" /> Download PDF
          </button>
          {/* <button className="btn" onClick={handleShare}>
            <FaShare className="icon" /> Share
          </button> */}
          <button className="btn btn-print" onClick={handlePrint}>
            <FaPrint className="icon" /> Print
          </button>
        </div>
        <div ref={invoiceRef} id="invoiceRef" dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
      </div></>
  );
};

export default InvoicePrint;
