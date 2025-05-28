
// src/routes/homeRoutes.ts
import express, { Request, Response, Router } from 'express';

// Interface voor je item data
interface Images {
  icon: string;
  large?: string;
}

interface Item {
  id: number;
  name: string;
  images: Images;
  description?: string;
}

const router: Router = express.Router();

// Mock data - vervang dit met echte database calls
const mockItem: Item = {
  id: 1,
  name: "Epische Schild",
  images: {
    icon: "/images/shield-icon.png",
    large: "/images/shield-large.jpg"
  },
  description: "Een krachtig magisch schild voor thuisverdediging!"
};

// Homepagina route
router.get('/', (req: Request, res: Response) => {
  res.render('home', {
    title: "Mijn Geweldige Homepagina",
    item: mockItem,
    featuredItems: [mockItem, mockItem, mockItem] // 3x hetzelfde item als voorbeeld
  });
});

export default router;