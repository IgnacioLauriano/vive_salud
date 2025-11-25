module.exports = {
    obtenerProductos: (req, res) => {
        const db = req.app.get('db');

        const query = "SELECT * FROM productos";

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error al consultar productos:", err);
                return res.status(500).json({ error: "Error al obtener productos" });
            }
            res.json(results);
        });
    }
};
