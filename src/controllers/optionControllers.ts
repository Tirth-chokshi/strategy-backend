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
      res
        .status(400)
        .json({ message: "Invalid Strike Price. Must be a number." });
      return;
    }

    // Find both CE and PE options for the given strike price
    const optionDetails = await Option.find({ strikePrice });

    if (!optionDetails || optionDetails.length === 0) {
      res.status(404).json({ message: "Option details not found." });
      return;
    }

    res.status(200).json({
      options: optionDetails.map((opt) => ({
        tradingSymbol: opt.tradingSymbol,
        instrumentToken: opt.instrumentToken,
        option: opt.option,
      })),
    });
  } catch (error) {
    console.error("Error fetching option details:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

interface SuggestionRequest {
  query: string;
}

export const suggestion = async (
  req: Request<{}, {}, SuggestionRequest>,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.body;

    // If query is empty or not a number
    if (!query || isNaN(Number(query))) {
      res.status(400).json({
        message: "Query must be a number",
        suggestions: [],
      });
      return;
    }

    // Convert query to string to ensure proper regex matching
    const queryString = query.toString();

    // Create a regex pattern that matches strike prices containing the query numbers
    const queryRegex = new RegExp(queryString);

    // Find strike prices that match the regex pattern
    const suggestions = await Option.aggregate([
      {
        // Convert strikePrice to string for regex matching
        $addFields: {
          strikePriceString: {
            $toString: "$strikePrice",
          },
        },
      },
      {
        $match: {
          strikePriceString: queryRegex,
        },
      },
      {
        // Group by strike price to get unique values
        $group: {
          _id: "$strikePrice",
        },
      },
      {
        // Sort strike prices in ascending order
        $sort: {
          _id: 1,
        },
      },
      {
        // Limit results to prevent overwhelming response
        $limit: 10,
      },
    ]);

    // Extract strike prices from aggregation result
    const strikePrices = suggestions.map((item) => item._id);

    res.json({
      suggestions: strikePrices,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const fetchValues = async (
  req: Request,
  res: Response
): Promise<void> => {};
