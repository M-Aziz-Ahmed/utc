import DynamicFeilds from "@/models/DynamicFeilds";
import Tax from "@/models/Tax";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

// Standard tax definitions used by the seeded fields.
const TAX_SEEDS = [
    { name: '10% Tax', rate: 10, type: 'percentage', code: 'PCT10', description: '10% standard tax' },
    { name: '10,000x Multiplier', rate: 10000, type: 'multiplier', code: 'MULT10000', description: 'Push price = PP x 10000' },
    { name: 'Millionth Multiplier', rate: 0.000001, type: 'multiplier', code: 'MULT1E-6', description: 'Convert to millions' },
];

const YEARS = (() => {
    const years = [];
    for (let y = new Date().getFullYear(); y >= 1950; y--) years.push(String(y));
    return years;
})();

// Vehicle Details form (add-vehicles)
const ADD_VEHICLES_FIELDS = [
    { label: 'Purchase Date', type: 'date', isRequired: true },
    { label: 'LOT No.', type: 'text', isRequired: true },
    { label: 'Engine Type', type: 'dropdown', isRequired: true, options: ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'PETROL'] },
    { label: 'Engine Capacity', type: 'number', isRequired: true },
    { label: 'Year Make', type: 'select-year', isRequired: true },
    { label: 'Transmission', type: 'dropdown', isRequired: true, options: ['AUTOMATIC', 'MANUAL', 'CVT', 'DCT', 'TIPTRONIC', 'AGS', 'OTHER'] },
    { label: 'Doors', type: 'number', isRequired: true },
    { label: 'Seats', type: 'number', isRequired: true },
    { label: 'Color', type: 'text', isRequired: true },
    { label: 'Millage', type: 'number', isRequired: true },
    { label: 'Chassis No.', type: 'text', isRequired: true },
    { label: 'PP', type: 'number' },
    { label: 'Condition', type: 'dropdown', isRequired: true, options: ['Good', 'Excellent', 'Fair', 'Poor', 'New'] },
    { label: 'Vehicle Images', type: 'image' },
];

// Account Details form (accounts)
const ACCOUNT_FIELDS = [
    { label: 'PUSH PRICE', type: 'tax', tax: '10,000x Multiplier', linkedField: 'PP' },
    { label: 'PUSH PRICE TAX', type: 'tax', tax: '10% Tax', linkedField: 'PUSH PRICE' },
    { label: 'AUCTION FEE', type: 'number' },
    { label: 'AUCTION FEE TAX', type: 'tax', tax: '10% Tax', linkedField: 'AUCTION FEE' },
    { label: 'RECYCLE', type: 'number' },
    { label: 'ZEKIN', type: 'number' },
    { label: 'RIKUSO COMPANY', type: 'text' },
    { label: 'RIKUSO EXPENSE', type: 'number' },
    { label: 'RIKUSO TAX', type: 'tax', tax: '10% Tax', linkedField: 'RIKUSO EXPENSE' },
    { label: 'REMARKS', type: 'text' },
    { label: 'UTC COMMISSOIN', type: 'number' },
    { label: 'MAINTENANCE EXPENSE', type: 'number' },
    { label: 'MAINTENANCE REMARKS', type: 'text' },
    { label: 'MISC. EXPENSE', type: 'number' },
    { label: 'KENSA / INSPECTION FEE', type: 'number' },
    { label: 'SHIPMENT FREIGT', type: 'number' },
    { label: 'LOADING + VANNING EXPENSE', type: 'number' },
    {
        label: 'FOB PRICE', type: 'sum',
        linkedFields: ['PUSH PRICE', 'PUSH PRICE TAX', 'LOADING + VANNING EXPENSE'],
    },
    {
        label: 'TOTAL PRICE', type: 'formula',
        formulaFields: [
            { field: 'FOB PRICE', operation: 'add' },
            { field: 'AUCTION FEE', operation: 'add' },
            { field: 'AUCTION FEE TAX', operation: 'add' },
            { field: 'RECYCLE', operation: 'add' },
            { field: 'RIKUSO EXPENSE', operation: 'add' },
            { field: 'RIKUSO TAX', operation: 'add' },
            { field: 'UTC COMMISSOIN', operation: 'add' },
            { field: 'MAINTENANCE EXPENSE', operation: 'add' },
            { field: 'MISC. EXPENSE', operation: 'add' },
            { field: 'KENSA / INSPECTION FEE', operation: 'add' },
            { field: 'SHIPMENT FREIGT', operation: 'add' },
        ],
    },
    { label: 'CONVERSION RATE', type: 'number' },
    {
        label: 'TOTAL AMOUNT IN - TZS', type: 'formula',
        formulaFields: [
            { field: 'TOTAL PRICE', operation: 'add' },
            { field: 'CONVERSION RATE', operation: 'multiply' },
        ],
    },
    { label: 'VEHICLE DUTY', type: 'number' },
    { label: 'CUSTOM CLEARANCE EXPENSES', type: 'number' },
    {
        label: 'COSTING PRICE APPROX.', type: 'sum',
        linkedFields: ['TOTAL AMOUNT IN - TZS', 'VEHICLE DUTY', 'CUSTOM CLEARANCE EXPENSES'],
    },
    { label: 'PRICE IN MILLION - TZS', type: 'tax', tax: 'Millionth Multiplier', linkedField: 'COSTING PRICE APPROX.' },
    { label: 'FINAL PRICE', type: 'number', showOnAdminCard: true },
];

export const POST = async () => {
    try {
        await dbConnect();

        const created = [];
        const skipped = [];
        const taxesCreated = [];
        const taxesSkipped = [];

        // 1) Ensure the standard taxes exist and resolve their ObjectIds by name
        const taxIds = {};
        for (const t of TAX_SEEDS) {
            let existing = await Tax.findOne({ name: t.name });
            if (!existing) {
                existing = await Tax.create(t);
                taxesCreated.push(t.name);
            } else {
                taxesSkipped.push(t.name);
            }
            taxIds[t.name] = existing._id;
        }

        // 2) Seed fields for a given form, skipping any that already exist
        const seedForm = async (belongsto, fieldDefs) => {
            let order = 0;
            for (const f of fieldDefs) {
                const existing = await DynamicFeilds.findOne({ label: f.label, belongsto });
                if (existing) {
                    skipped.push(`${belongsto}: ${f.label}`);
                    continue;
                }

                const data = {
                    label: f.label,
                    type: f.type,
                    isRequired: !!f.isRequired,
                    belongsto,
                    order: order++,
                    showOnCard: true,
                    displayAsPrice: false,
                    showOnPublicCard: false,
                    showOnAdminCard: !!f.showOnAdminCard,
                };

                if (f.type === 'tax') {
                    data.linkedTax = taxIds[f.tax];
                    data.linkedField = f.linkedField;
                }
                if (f.type === 'sum' && Array.isArray(f.linkedFields)) {
                    data.linkedFields = f.linkedFields;
                }
                if (f.type === 'formula' && Array.isArray(f.formulaFields)) {
                    data.formulaFields = f.formulaFields;
                }
                if (f.type === 'select-year') {
                    data.options = YEARS;
                } else if (Array.isArray(f.options)) {
                    data.options = f.options;
                }

                await DynamicFeilds.create(data);
                created.push(`${belongsto}: ${f.label}`);
            }
        };

        await seedForm('add-vehicles', ADD_VEHICLES_FIELDS);
        await seedForm('accounts', ACCOUNT_FIELDS);

        return NextResponse.json({
            message: 'Seed complete',
            created,
            skipped,
            taxesCreated,
            taxesSkipped,
        }, { status: 200 });
    } catch (error) {
        console.error('seedFields error:', error);
        return NextResponse.json({ message: 'Error seeding fields', error: error.message }, { status: 500 });
    }
};
