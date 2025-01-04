import { Request, Response } from "express";
import Option, { IOption } from "../models/Option";

// Function to fetch instrumentToken and option based on strikePrice and tradingSymbol
export const getOptionDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const strikePrice = parseFloat(req.body.strikePrice);

    if (isNaN(strikePrice)) {
      res.status(400).json({ message: "Invalid Strike Price. Must be a number." });
      return;
    }

    // Find both CE and PE options for the given strike price
    const optionDetails = await Option.find({ strikePrice });

    if (!optionDetails || optionDetails.length === 0) {
      res.status(404).json({ message: "Option details not found." });
      return;
    }

    res.status(200).json({
      options: optionDetails.map(opt => ({
        tradingSymbol: opt.tradingSymbol,
        instrumentToken: opt.instrumentToken,
        option: opt.option
      }))
    });
  } catch (error) {
    console.error("Error fetching option details:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const suggestion = async (
  req: Request<{}, {}, { query: string; type: keyof IOption; strikePrice?: string }>,
  res: Response
): Promise<void> => {
  try {
    const { query, type } = req.body;

    if (type === 'strikePrice') {
      const numericQuery = parseFloat(query);
      if (!isNaN(numericQuery)) {
        // For strike price suggestions, find distinct values within a range
        const suggestions = await Option.aggregate([
          {
            $match: {
              strikePrice: {
                $gte: numericQuery,
                $lt: numericQuery + 500
              }
            }
          },
          {
            $group: {
              _id: "$strikePrice"
            }
          },
          {
            $limit: 10
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        
        res.json({ suggestions: suggestions.map(item => item._id) });
        return;
      }
    } else if (type === 'tradingSymbol' && req.body.strikePrice) {
      const strikePrice = parseFloat(req.body.strikePrice);
      
      if (isNaN(strikePrice)) {
        res.status(400).json({ message: "Invalid Strike Price. Must be a number." });
        return;
      }

      // If querying trading symbols and strike price is provided
      const options = await Option.find({
        strikePrice
      }).select('tradingSymbol option').limit(2);
      
      res.json({ 
        suggestions: options.map(opt => opt.tradingSymbol)
      });
      return;
    }

    // Default case for other fields - only apply regex for string fields
    if (type !== 'strikePrice' && type !== 'instrumentToken') {
      const queryRegex = new RegExp(query, "i");
      const options = await Option.find({ [type]: queryRegex })
        .select(type)
        .limit(10);

      res.json({ 
        suggestions: options.map(opt => opt[type as keyof IOption])
      });
    } else {
      res.status(400).json({ message: "Invalid query type for regex search" });
    }
    
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const fetchValues = async (req: Request, res: Response): Promise<void> => {
  
};
