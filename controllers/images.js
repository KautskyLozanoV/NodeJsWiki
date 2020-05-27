exports.uploadImage = (req, res) => {
    const url = req.protocol + '://' + req.get('host')
    const imagePath = url + "/images/" + req.file.filename

    res.status(201).json({ imagePath: imagePath });
}