var PDFGenerator = require('pdfkit');
var fs = require('fs');

class invoiceGenerator {
    constructor(invoice, res) {
        this.invoice = invoice
        this.res = res
    }

    generateHeaders(doc) {
        const billingAddress = this.invoice.addresses.billing

        doc
            // .image('', 0, 0, { width: 250 })
            .fillColor('#000')
            .fontSize(20)
            .text('INVOICE', 275, 50, { align: 'right' })
            .fontSize(10)
            .text(`Invoice Number: ${this.invoice.invoiceNumber}`, { align: 'right' })
            // .text(`Due: ${this.invoice.dueDate}`, { align: 'right' })
            .moveDown()
            .text(`Billing Address:\n ${billingAddress.name}\n${billingAddress.address}\n${billingAddress.state},${billingAddress.country}, ${billingAddress.postalCode}`, { align: 'right' })

        const beginningOfPage = 50
        const endOfPage = 550

        doc.moveTo(beginningOfPage, 200)
            .lineTo(endOfPage, 200)
            .stroke()

        doc.text(`Memo: ${this.invoice.memo || 'N/A'}`, 50, 210)

        doc.moveTo(beginningOfPage, 250)
            .lineTo(endOfPage, 250)
            .stroke()

    }

    generateTable(doc) {
        const tableTop = 270
        const tableBottom = 400
        // const itemCodeX = 50
        const nameX = 100
        const quantityX = 250
        const priceX = 300
        // const amountX = 350
        const totalX = 250
        const discountX = 300

        doc
            .fontSize(10)
            // .text('Item Code', itemCodeX, tableTop, { bold: true })
            .text('Name', nameX, tableTop)
            .text('Quantity', quantityX, tableTop)
            .text('Price', priceX, tableTop)
            .text('Total', totalX, tableBottom)
            // .text('Amount', amountX, tableTop)
            .text('Discount amt', discountX, tableBottom)

        const items = this.invoice.items
        let i = 0
        // let totalPrice = 0
        const y = tableBottom + 25

        for (i = 0; i < items.length; i++) {
            const item = items[i]
            // totalPrice += items[i].price_num
            const x = tableTop + 25 + (i * 25)

            doc
                .fontSize(10)
                // .text(item.itemCode, itemCodeX, x)
                .text(item.name, nameX, x)
                .text(item.quantity, quantityX, x)
                .text(`${item.price}`, priceX, x)
            // .text(`$ ${item.amount}`, amountX, y)
        }
        // console.log(totalPrice);

        doc
            .text(`${this.invoice.currency} ${this.invoice.subtotal}`, totalX, y)
            .text(`${this.invoice.currency} ${this.invoice.subtotal - this.invoice.paid}`, discountX, y)
    }

    generateFooter(doc) {
        doc
            .fontSize(10)
            .text(`Payment received online. `, 50, 700, {
                align: 'center'
            })
    }

    generate() {
        // create a document the same way
        const theOutput = new PDFGenerator()

        console.log(this.invoice)

        const fileName = `uploads/orderInvoices/Invoice_${this.invoice.invoiceNumber}.pdf`

        // pipe to a writable stream which would save the result into the same directory
        theOutput.pipe(fs.createWriteStream(fileName))
        theOutput.pipe(this.res)

        this.generateHeaders(theOutput)

        theOutput.moveDown()

        this.generateTable(theOutput)

        this.generateFooter(theOutput)

        // write out file
        theOutput.end()

        // return fileName
    }
}

module.exports = invoiceGenerator