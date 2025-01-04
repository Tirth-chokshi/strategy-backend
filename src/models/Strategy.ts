import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaces for schemas
interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

interface IStrategyDetail extends Document {
    strikePrice: number;
    tradingSymbol: string;
    instrumentToken: string;
    type: 'CE' | 'PE' | 'FUTURES';
    createdAt: Date;
    updatedAt: Date;
}

interface IStrategy extends Document {
    userId: mongoose.Types.ObjectId;
    strategyName: string;
    status: boolean;
    strategyDetails: IStrategyDetail[];
    createdAt: Date;
    updatedAt: Date;
}

// User Schema
const UserSchema: Schema<IUser> = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    resetPasswordToken: {
        type: String,
        required: false,
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Strategy Detail Schema
const StrategyDetailSchema: Schema<IStrategyDetail> = new mongoose.Schema({
    strikePrice: {
        type: Number,
        required: true
    },
    tradingSymbol: {
        type: String,
        required: true
    },
    instrumentToken: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['CE', 'PE', 'FUTURES']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Main Strategy Schema
const StrategySchema: Schema<IStrategy> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    strategyName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: false
    },
    strategyDetails: [StrategyDetailSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps middleware
UserSchema.pre<IUser>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

StrategySchema.pre<IStrategy>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create indexes for better query performance
StrategySchema.index({ userId: 1, strategyName: 1 });
UserSchema.index({ email: 1 });

// Create models
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
const Strategy: Model<IStrategy> = mongoose.model<IStrategy>('Strategy', StrategySchema);
const StrategyDetail: Model<IStrategyDetail> = mongoose.model<IStrategyDetail>('StrategyDetail', StrategyDetailSchema);

export { User, Strategy, StrategyDetail, IUser, IStrategy, IStrategyDetail };
