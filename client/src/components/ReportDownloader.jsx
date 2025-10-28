import React, { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download } from 'lucide-react'

const ReportDownloader = ({ targetId, fileName = 'MindScale-Report.pdf', title = 'MindScale Report', label = 'Download Report', pageBreakSelector }) => {
  const [downloading, setDownloading] = useState(false)
  const buttonRef = useRef(null)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      // Prefer dedicated print report if present
      const target = document.getElementById('print-report') || document.getElementById(targetId)
      if (!target) return

      // Apply a lightweight print class to only the target for clearer text
      target.classList.add('pdf-capture')

      const canvas = await html2canvas(target, {
        backgroundColor: null,
        scale: 2.2,
        useCORS: true,
        ignoreElements: (el) => {
          // Skip the download button (and any node marked to ignore)
          if (!el) return false
          if (el === buttonRef.current) return true
          if (el.getAttribute && el.getAttribute('data-html2canvas-ignore') !== null) return true
          return false
        }
      })

      // Cleanup
      target.classList.remove('pdf-capture')

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Add header with logo and title
      const logo = new Image()
      const loadLogo = () => new Promise((resolve) => { logo.onload = resolve; logo.src = '/Logo.png' })
      await loadLogo()
      const margin = 36
      const headerHeight = 54
      const logoHeight = 36
      const logoWidth = (logo.width / logo.height) * logoHeight
      pdf.setFillColor(248, 250, 252)
      pdf.rect(0, 0, pageWidth, headerHeight, 'F')
      pdf.addImage(logo, 'PNG', margin, (headerHeight - logoHeight) / 2, logoWidth, logoHeight)
      pdf.setFontSize(16)
      pdf.setTextColor(30, 41, 59)
      pdf.text(title, margin + logoWidth + 12, headerHeight / 2 + 5)

      // Fit to width and paginate (with optional manual page break)
      const contentTop = headerHeight + margin / 2
      const contentHeight = pageHeight - contentTop - margin
      const contentWidth = pageWidth - margin * 2
      const scale = contentWidth / canvas.width
      const sliceHeightPx = contentHeight / scale

      let renderedY = 0
      const totalHeight = canvas.height
      let breakY = null
      if (pageBreakSelector) {
        const breaker = document.querySelector(pageBreakSelector)
        if (breaker) {
          const { top: tTop } = breaker.getBoundingClientRect()
          const { top: gTop } = target.getBoundingClientRect()
          breakY = (tTop - gTop) * (canvas.height / target.offsetHeight)
        }
      }
      while (renderedY < totalHeight) {
        let sliceHeight = Math.min(sliceHeightPx, totalHeight - renderedY)
        if (breakY && renderedY < breakY && (renderedY + sliceHeight) > breakY) {
          sliceHeight = breakY - renderedY
        }
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = Math.floor(sliceHeight)
        const ctx = sliceCanvas.getContext('2d')
        ctx.drawImage(canvas, 0, renderedY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
        const sliceData = sliceCanvas.toDataURL('image/png')
        const sliceRenderHeight = sliceHeight * scale
        if (renderedY > 0) {
          pdf.addPage()
          pdf.setFillColor(248, 250, 252)
          pdf.rect(0, 0, pageWidth, headerHeight, 'F')
          pdf.addImage(logo, 'PNG', margin, (headerHeight - logoHeight) / 2, logoWidth, logoHeight)
          pdf.setFontSize(16)
          pdf.setTextColor(30, 41, 59)
          pdf.text(title, margin + logoWidth + 12, headerHeight / 2 + 5)
        }
        pdf.addImage(sliceData, 'PNG', margin, contentTop, contentWidth, sliceRenderHeight)
        renderedY += sliceHeight
        if (breakY && renderedY === breakY) {
          // Next page will continue after the break
        }
      }

      pdf.save(fileName)
    } catch (_) {
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleDownload}
      disabled={downloading}
      className="btn-secondary inline-flex items-center space-x-2"
      title="Download report as PDF"
      data-html2canvas-ignore
    >
      {downloading ? (
        <>
          <span className="inline-flex relative h-4 w-4">
            <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-gray-300 border-t-primary-600"></span>
          </span>
          <span>Preparing…</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export default ReportDownloader


