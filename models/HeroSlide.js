import mongoose from 'mongoose'

const featureSchema = new mongoose.Schema({
    icon: { type: String, default: '' },   // emoji or HTML entity
    text: { type: String, default: '' },
}, { _id: false })

const heroSlideSchema = new mongoose.Schema({
    order:           { type: Number, default: 0 },
    active:          { type: Boolean, default: true },
    backgroundImage: { type: String, default: '' },  // Cloudinary URL
    publicId:        { type: String, default: '' },  // Cloudinary publicId for deletion
    overlay:         { type: Number, default: 50 },  // overlay opacity 0-100
    textColor:       { type: String, default: '#ffffff' },
    badgeText:       { type: String, default: '' },
    heading:         { type: String, default: '' },
    headingAccent:   { type: String, default: '' },  // coloured word in heading
    subheading:      { type: String, default: '' },
    ctaText:         { type: String, default: 'Browse Our Stock' },
    ctaHref:         { type: String, default: '/stock' },
    features:        { type: [featureSchema], default: [] },
}, { timestamps: true })

export default mongoose.models.HeroSlide || mongoose.model('HeroSlide', heroSlideSchema)
