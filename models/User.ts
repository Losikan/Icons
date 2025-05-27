import { Schema, model } from 'mongoose';
import skinsData from '../public/skins.json'; // Zorg dat dit pad klopt

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Gebruikersnaam is verplicht'],
    unique: true,
    trim: true,
    minlength: [3, 'Minimaal 3 karakters'],
    maxlength: [20, 'Maximaal 20 karakters']
  },
  email: {
    type: String,
    required: [true, 'E-mail is verplicht'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Ongeldig e-mailformaat']
  },
  coins: {
    type: Number,
    default: 1000,
    min: [0, 'Saldo kan niet negatief zijn']
  },
  inventory: {  // 🔄 Changed from purchasedItems
    type: [String],
    default: [],
    index: true,
    validate: {
      validator: function(v: string[]) {
        return v.every(id => 
          skinsData.data.items.br.some(item => item.id === id)
        );
      },
      message: 'Item met ID {VALUE} bestaat niet in de shop'
    }
  },
  password: {
    type: String,
    required: [true, 'Wachtwoord is verplicht'],
    minlength: [8, 'Minimaal 8 karakters']
  },
  resetToken: {
    type: String,
    select: false
  },
  resetTokenExpiration: {
    type: Date,
    select: false
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetToken;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.resetToken;
      return ret;
    }
  }
});

// Optimalisatie voor zoekopdrachten
userSchema.index({ username: 'text', email: 'text' });
userSchema.index({ inventory: 1 }); // Snellere queries op inventory

// Virtual voor aankoophistorie
userSchema.virtual('purchaseHistory').get(function() {
  return this.inventory.map(id => 
    skinsData.data.items.br.find(item => item.id === id)
  );
});

export default model('User', userSchema);