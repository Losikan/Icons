import mongoose from 'mongoose';
import Item from './models/Item';

async function seedItems() {
    try {
        await mongoose.connect('mongodb://localhost:27017/your-db-name');

        const items = [
            {
                _id: 'char1',
                name: 'Character Skin 1',
                price: 100,
                images: { icon: 'assets/images/c1.jpg' },
                description: 'Premium character skin'
            },
            {
                _id: 'char2',
                name: 'Character Skin 2',
                price: 150,
                images: { icon: 'assets/images/c2.jpg' },
                description: 'Rare character skin'
            },
            {
                _id: 'char3',
                name: 'Character Skin 3',
                price: 200,
                images: { icon: 'assets/images/c3.jpg' },
                description: 'Legendary character skin'
            }
        ];

        for (const itemData of items) {
            const existingItem = await Item.findById(itemData._id);
            if (!existingItem) {
                const newItem = new Item(itemData);
                await newItem.save();
                console.log(`Item ${itemData._id} created`);
            } else {
                console.log(`Item ${itemData._id} already exists`);
            }
        }

        console.log('Database seeding complete');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedItems();