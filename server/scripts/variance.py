import json
import sys

CENTS = 2


def line_total(line):
    return line["qty"] * line["unitPrice"]


def calc_variance(po_lines, invoice_lines, tax_rate=0.0):
    po_subtotal = sum(line_total(line) for line in po_lines)
    invoice_subtotal = sum(line_total(line) for line in invoice_lines)
    po_total = po_subtotal * (1 + tax_rate)
    invoice_total = invoice_subtotal * (1 + tax_rate)
    return round(invoice_total - po_total, CENTS)


if __name__ == "__main__":
    data = json.load(sys.stdin)
    print(calc_variance(data["poLines"], data["invoiceLines"], data.get("taxRate", 0.0)))