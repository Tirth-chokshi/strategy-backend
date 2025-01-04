import fs from 'fs';
import csv from 'csv-parser';
import Option from '../models/Option';

export const importOptionsFromCSV = async (filePath: string): Promise<void> => {
    try {
        const results: any[] = [];

        // Read CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    results.push({
                        strikePrice: Number(data.STRIKE_PRICE),
                        tradingSymbol: data.TRADING_SYMBOL,
                        instrumentToken: Number(data.INSTRUMENT_TOKEN),
                        option: data.OPTION
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Clear existing data
        await Option.deleteMany({});

        // Insert new data
        await Option.insertMany(results);
        
        console.log('CSV data successfully imported to MongoDB');
    } catch (error) {
        console.error('Error importing CSV data:', error);
        throw error;
    }
};
