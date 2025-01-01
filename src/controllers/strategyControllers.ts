import { Request, Response } from "express";
import { Strategy, IStrategy, IStrategyDetail } from "../models/Strategy";

class StrategyController {
  // Create a new strategy with details
  // Create a new strategy with details
  async createStrategy(req: any, res: any) {
    try {
      const { strategyName, status, strategyDetails } = req.body;
      const userId = req.user?._id; // Notice the optional chaining

      // Validate required fields
      if (!strategyName || !Array.isArray(strategyDetails)) {
        return res.status(400).json({
          success: false,
          message: "Strategy name and details are required",
        });
      }

      // Create new strategy
      const strategy = new Strategy({
        userId,
        strategyName,
        status: status || false,
        strategyDetails,
      });

      await strategy.save();

      res.status(201).json({
        success: true,
        data: strategy,
        message: "Strategy created successfully",
      });
    } catch (error) {
      console.error("Strategy creation error:", error); // Add error logging
      res.status(500).json({
        success: false,
        message: "Error creating strategy",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get all strategies for a user
  async getStrategies(req: any, res: any) {
    try {
      const userId = req.user._id;
      const strategies = await Strategy.find({ userId });

      res.status(200).json({strategies});
    } catch (error) {
      res.status(500).json({
        message: "Error fetching strategies",
      });
    }
  }

  // Get single strategy by ID
  async getStrategyById(req: any, res: any) {
    try {
      const { strategyId } = req.params;
      const userId = req.user._id;

      const strategy = await Strategy.findOne({
        _id: strategyId,
        userId,
      });

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy not found",
        });
      }

      res.status(200).json({
        success: true,
        data: strategy,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching strategy",
      });
    }
  }

  // Update strategy
  async updateStrategy(req: any, res: any) {
    try {
      const { strategyId } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      const strategy = await Strategy.findOneAndUpdate(
        { _id: strategyId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy not found",
        });
      }

      res.status(200).json({
        success: true,
        data: strategy,
        message: "Strategy updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating strategy",
      });
    }
  }

  // Delete strategy
  async deleteStrategy(req: any, res: any) {
    try {
      const { strategyId } = req.params;
      const userId = req.user._id;

      const strategy = await Strategy.findOneAndDelete({
        _id: strategyId,
        userId,
      });

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Strategy deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting strategy",
      });
    }
  }

  // Add strategy details to existing strategy
  async addStrategyDetails(req: any, res: any) {
    try {
      const { strategyId } = req.params;
      const userId = req.user._id;
      const newDetails: IStrategyDetail[] = req.body.strategyDetails;

      if (!Array.isArray(newDetails)) {
        return res.status(400).json({
          success: false,
          message: "Strategy details must be an array",
        });
      }

      const strategy = await Strategy.findOne({ _id: strategyId, userId });

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy not found",
        });
      }

      strategy.strategyDetails.push(...newDetails);
      await strategy.save();

      res.status(200).json({
        success: true,
        data: strategy,
        message: "Strategy details added successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error adding strategy details",
      });
    }
  }

  // Update specific strategy detail
  async updateStrategyDetail(req: any, res: any) {
    try {
      const { strategyId, detailId } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      const strategy = await Strategy.findOneAndUpdate(
        {
          _id: strategyId,
          userId,
          "strategyDetails._id": detailId,
        },
        {
          $set: {
            "strategyDetails.$": updateData,
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      );

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy or detail not found",
        });
      }

      res.status(200).json({
        success: true,
        data: strategy,
        message: "Strategy detail updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating strategy detail",
      });
    }
  }

  // Remove strategy detail
  async removeStrategyDetail(req: any, res: any) {
    try {
      const { strategyId, detailId } = req.params;
      const userId = req.user._id;

      const strategy = await Strategy.findOneAndUpdate(
        { _id: strategyId, userId },
        {
          $pull: { strategyDetails: { _id: detailId } },
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy or detail not found",
        });
      }

      res.status(200).json({
        success: true,
        data: strategy,
        message: "Strategy detail removed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error removing strategy detail",
      });
    }
  }

  
  async getStrategiesByUser(req: any, res: any) {
    try {
        const userId = req.user._id;
        
        const strategies = await Strategy.find({ userId });
        
        res.status(200).json({
            success: true,
            strategies: strategies, // Changed from data to strategies to match frontend
            message: "Strategies fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching strategies"
        });
    }
}
  // Toggle strategy status
  async toggleStrategyStatus(req: any, res: any) {
    try {
      const { strategyId } = req.params;
      const userId = req.user._id;

      const strategy = await Strategy.findOne({ _id: strategyId, userId });

      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: "Strategy not found",
        });
      }

      strategy.status = !strategy.status;
      strategy.updatedAt = new Date();
      await strategy.save();

      res.status(200).json({
        success: true,
        data: strategy,
        message: "Strategy status toggled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error toggling strategy status",
      });
    }
  }
}

export default new StrategyController();
