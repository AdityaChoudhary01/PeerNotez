const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollectionSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    notes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Note' 
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Collection', CollectionSchema, 'peerNotez_collections');
