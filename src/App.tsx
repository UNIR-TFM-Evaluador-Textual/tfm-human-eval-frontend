import { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

interface Anuncio {
	id: number;
	imagen_local: string;
	fecha: string;
	comercio: string;
	analisis_modelos: {
		texto_analizado: { descripcion: string };
		texto_imagen: { descripcion: string };
	}
}

interface Calificacion {
	formalidad: number;
	agresividad: number;
	edad: string;
	genero: string;
}

function App() {
	const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
	const [indice, setIndice] = useState(() => {
		const guardado = localStorage.getItem("indiceActual");
		return guardado ? parseInt(guardado) : 0;
	});
	const [guardado, setGuardado] = useState(false);

	const [calificacion, setCalificacion] = useState<Calificacion>({
		formalidad: 0,
		agresividad: 0,
		edad: "neutro",
		genero: "neutro"
	});
	const [calificacionImg, setCalificacionImg] = useState<Calificacion>({
		formalidad: 0,
		agresividad: 0,
		edad: "neutro",
		genero: "neutro"
	});

	const inicio = 0;
	const fin = 500;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") {
			setIndice(prev => {
				const nuevo = Math.min(prev + 1, anuncios.length - 1);
				localStorage.setItem("indiceActual", nuevo.toString());
				return nuevo;
			});
			} else if (e.key === "ArrowLeft") {
			setIndice(prev => {
				const nuevo = Math.max(prev - 1, 0);
				localStorage.setItem("indiceActual", nuevo.toString());
				return nuevo;
			});
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [anuncios.length]);


	useEffect(() => {
		axios
		.get<Anuncio[]>(`http://localhost:5000/anuncios?inicio=${inicio}&fin=${fin}`)
		.then((res) => {
			console.log(res.data);
			setAnuncios(res.data)
		})
		.catch((err) => console.error(err));
	}, []);

	useEffect(() => {
		setCalificacion({
			formalidad: 0,
			agresividad: 0,
			edad: "neutro",
			genero: "neutro"
		});
		setCalificacionImg({
			formalidad: 0,
			agresividad: 0,
			edad: "neutro",
			genero: "neutro"
		});
		if (indice < 0) {
			setIndice(0);
		} else if (indice > anuncios?.length - 1) {
			setIndice(anuncios?.length - 1);
		}
	}, [indice, anuncios]);

	const anuncioActual = anuncios[indice];

	const handleChange = (campo: keyof Calificacion, valor: string | number) => {
		setCalificacion({ ...calificacion, [campo]: valor });
	};
	const handleChangeImg = (campo: keyof Calificacion, valor: string | number) => {
		setCalificacionImg({ ...calificacionImg, [campo]: valor });
	};

	const enviarCalificacion = async () => {
		if (!anuncioActual) return;

		const payload = {
		id: anuncioActual?.id,
		imagen_local: anuncioActual?.imagen_local,
		fecha: anuncioActual?.fecha,
		comercio: anuncioActual?.comercio,
		analisis_modelos: {
			texto_analizado: {
				descripcion: anuncioActual?.analisis_modelos?.texto_analizado?.descripcion,
				resultados: calificacion
			},
			texto_imagen: {
				descripcion: anuncioActual?.analisis_modelos?.texto_imagen?.descripcion,
				resultados: calificacionImg
			}
		}
		};

		try {
			await axios.post("http://localhost:5000/calificar", payload);
			setGuardado(true);
			setTimeout(() => setGuardado(false), 1500);
			localStorage.setItem("indiceActual", (indice + 1).toString());
			setIndice((prev) => prev + 1);
		} catch (err) {
			alert("Error al guardar calificación");
			console.error(err);
		}
	};

	if (!anuncioActual) return <div>Todos los anuncios fueron calificados ✅</div>;

	return (
		<div style={{ margin: "0 auto", fontFamily: "sans-serif", width: "100vw", }}>
			<h1 style={{textAlign: "center"}}>Evaluación de Anuncio</h1>
			<div style={{
				display: "flex",
				marginBottom: "20px",
				padding: "0px 50px",
				alignItems: "center",
				justifyContent: "flex-end",
				flexDirection: "row",
				columnGap: "10px",
			}}>
				<div className="btn-direccion" onClick={() => setIndice((prev) => prev - 1)}>{"<"}</div>
				<div className="btn-direccion" onClick={() => setIndice((prev) => prev + 1)}>{">"}</div>
				<label>
					Ir al anuncio #
					<input
					type="number"
					value={indice}
					onChange={(e) => {
						const nuevoIndice = parseInt(e.target.value) || 0;
						setIndice(nuevoIndice);
						localStorage.setItem("indiceActual", nuevoIndice.toString());
					}}
					style={{ width: "60px", marginLeft: "8px" }}/>
				</label>
				<div>de {anuncios?.length-1}</div>
			</div>

			{/* SECCION DE EVALUACION */}
			<div style={{
				display: "flex",
				flexDirection: "row",
				// columnGap: "2%",
			}}>
				<div style={{ width: "40%",
						display: "flex",
						justifyContent: "center",
						// alignItems: "center",
				}}>
					<img
						src={`http://localhost:5000/${anuncioActual?.imagen_local}`}
						alt="anuncio"
						style={{
							maxWidth: "85%",
							border: "1px solid #ccc",
							marginBottom: "10px",
							alignSelf: "flex-start",
							objectFit: 'contain',
						}}
					/>
				</div>
				<div style={{ width: "60%", paddingRight: 50, }}>
					<div style={{
						display: 'flex'
					}}>
						<div style={{ width: '50%', marginBottom: "10px", }}>
							<div style={{
								fontWeight: 'bold',
							}}>Descripción:</div>
							<div>{anuncioActual?.analisis_modelos?.texto_analizado?.descripcion}</div>
						</div>
						<div style={{ width: '50%', marginBottom: "10px", }}>
							<div style={{
								fontWeight: 'bold',
							}}>Imagen:</div>
							{/* <div>{anuncioActual?.analisis_modelos?.texto_imagen?.descripcion}</div> */}
						</div>
					</div>
					<div style={{
						display: 'flex'
					}}>
						<div style={{ width: '50%' }}>
							<fieldset>
								<legend>Formalidad:</legend>
								<label className="opcion-radio">
									<input type="radio" name="formalidad" value={0} checked={calificacion.formalidad === 0} onChange={() => handleChange("formalidad", 0)} />
									Informal</label>
								<label className="opcion-radio">
									<input type="radio" name="formalidad" value={1} checked={calificacion.formalidad === 1} onChange={() => handleChange("formalidad", 1)} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="formalidad" value={2} checked={calificacion.formalidad === 2} onChange={() => handleChange("formalidad", 2)} />
									Formal</label>
							</fieldset>

							<fieldset>
								<legend>Agresividad:</legend>
								<label className="opcion-radio">
									<input type="radio" name="agresividad" value={0} checked={calificacion.agresividad === 0} onChange={() => handleChange("agresividad", 0)} />
									No agresivo</label>
								<label className="opcion-radio">
									<input type="radio" name="agresividad" value={1} checked={calificacion.agresividad === 1} onChange={() => handleChange("agresividad", 1)} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="agresividad" value={2} checked={calificacion.agresividad === 2} onChange={() => handleChange("agresividad", 2)} />
									Agresivo</label>
							</fieldset>

							<fieldset>
								<legend>Edad objetivo:</legend>
								<label className="opcion-radio">
									<input type="radio" name="edad" value="neutro" checked={calificacion.edad === "neutro"} onChange={() => handleChange("edad", "neutro")} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="edad" value="18-29" checked={calificacion.edad === "18-29"} onChange={() => handleChange("edad", "18-29")} />
									18–29</label>
								<label className="opcion-radio">
									<input type="radio" name="edad" value="30-39" checked={calificacion.edad === "30-39"} onChange={() => handleChange("edad", "30-39")} />
									30–39</label>
								<label className="opcion-radio">
									<input type="radio" name="edad" value="40-49" checked={calificacion.edad === "40-49"} onChange={() => handleChange("edad", "40-49")} />
									40–49</label>
							</fieldset>

							<fieldset>
								<legend>Género objetivo:</legend>
								<label className="opcion-radio">
									<input type="radio" name="genero" value="neutro" checked={calificacion.genero === "neutro"} onChange={() => handleChange("genero", "neutro")} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="genero" value="male" checked={calificacion.genero === "male"} onChange={() => handleChange("genero", "male")} />
									Masculino</label>
								<label className="opcion-radio">
									<input type="radio" name="genero" value="female" checked={calificacion.genero === "female"} onChange={() => handleChange("genero", "female")} />
									Femenino</label>
							</fieldset>
						</div>


						{/* ================== TEXTO DE LA IMAGEN ================ */}
						<div style={{ width: '50%' }}>
							<fieldset>
								<legend>Formalidad:</legend>
								<label className="opcion-radio">
									<input type="radio" name="formalidad_img" value={0} checked={calificacionImg.formalidad === 0} onChange={() => handleChangeImg("formalidad", 0)} />
									Informal</label>
								<label className="opcion-radio">
									<input type="radio" name="formalidad_img" value={1} checked={calificacionImg.formalidad === 1} onChange={() => handleChangeImg("formalidad", 1)} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="formalidad_img" value={2} checked={calificacionImg.formalidad === 2} onChange={() => handleChangeImg("formalidad", 2)} />
									Formal</label>
							</fieldset>

							<fieldset>
								<legend>Agresividad:</legend>
								<label className="opcion-radio">
									<input type="radio" name="agresividad_img" value={0} checked={calificacionImg.agresividad === 0} onChange={() => handleChangeImg("agresividad", 0)} />
									No agresivo</label>
								<label className="opcion-radio">
									<input type="radio" name="agresividad_img" value={1} checked={calificacionImg.agresividad === 1} onChange={() => handleChangeImg("agresividad", 1)} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="agresividad_img" value={2} checked={calificacionImg.agresividad === 2} onChange={() => handleChangeImg("agresividad", 2)} />
									Agresivo</label>
							</fieldset>

							<fieldset>
								<legend>Edad objetivo:</legend>
								<label className="opcion-radio">
									<input type="radio" name="edad_img" value="neutro" checked={calificacionImg.edad === "neutro"} onChange={() => handleChangeImg("edad", "neutro")} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="edad_img" value="18-29" checked={calificacionImg.edad === "18-29"} onChange={() => handleChangeImg("edad", "18-29")} />
									18–29</label>
								<label className="opcion-radio">
									<input type="radio" name="edad_img" value="30-39" checked={calificacionImg.edad === "30-39"} onChange={() => handleChangeImg("edad", "30-39")} />
									30–39</label>
								<label className="opcion-radio">
									<input type="radio" name="edad_img" value="40-49" checked={calificacionImg.edad === "40-49"} onChange={() => handleChangeImg("edad", "40-49")} />
									40–49</label>
							</fieldset>

							<fieldset>
								<legend>Género objetivo:</legend>
								<label className="opcion-radio">
									<input type="radio" name="genero_img" value="neutro" checked={calificacionImg.genero === "neutro"} onChange={() => handleChangeImg("genero", "neutro")} />
									Neutro</label>
								<label className="opcion-radio">
									<input type="radio" name="genero_img" value="male" checked={calificacionImg.genero === "male"} onChange={() => handleChangeImg("genero", "male")} />
									Masculino</label>
								<label className="opcion-radio">
									<input type="radio" name="genero_img" value="female" checked={calificacionImg.genero === "female"} onChange={() => handleChangeImg("genero", "female")} />
									Femenino</label>
							</fieldset>
						</div>
					</div>
					




					<button style={{
						marginTop: "20px",
						borderRadius: "3px",
						padding: "10px 20px",
						backgroundColor: "#3f96c9ff",
						color: "white",
						border: "none",
						cursor: "pointer"
					}}
					onClick={enviarCalificacion}>
						Guardar calificación
					</button>

					{guardado && <p style={{ color: "green" }}>Guardado ✓</p>}
				</div>
			</div>
		</div>
	);
}

export default App;
