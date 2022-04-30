import mongoose from "mongoose"

const schema = mongoose.Schema({
	title: String,
	path: String,
    size: Number,
    added: {type: Date, default: Date.now}
})

export default mongoose.model("video", schema)