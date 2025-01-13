import { Request, Response } from 'express';

export async function getLiveStockPrice(
    req: Request,
    res: Response & { write: (data: string) => boolean }
  ): Promise<void> {
    let stockPrice = {
      price: generateRandomPrice()
    };
  
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(200);
  
    // Send new price every second
    const interval = setInterval(() => {
      stockPrice.price = generateRandomPrice();
      res.write(`data: ${JSON.stringify(stockPrice)}\n\n`);
    }, 1000);
  
    // Clean up interval if client disconnects
    req.on('close', () => {
      clearInterval(interval);
    });
  }
  
  // Helper function to generate more realistic stock prices
  function generateRandomPrice(): number {
    // Generate a random price between 10 and 1000 with 2 decimal places
    return Number((Math.random() * 99990 + 10).toFixed(2));
  }