import mongoose, { Schema, Document } from 'mongoose';

export interface IOption extends Document {
    strikePrice: number;
    tradingSymbol: string;
    instrumentToken: number;
    option: string;
}

const OptionSchema: Schema = new Schema({
    strikePrice: { type: Number, required: true },
    tradingSymbol: { type: String, required: true },
    instrumentToken: { type: Number, required: true },
    option: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IOption>('Option', OptionSchema);
