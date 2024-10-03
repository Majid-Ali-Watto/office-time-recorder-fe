import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import View from "./ViewTimes";

function App() {
	const [view, setView] = useState({});
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchTimes();
	}, []);

	async function fetchTimes() {
		setLoading(true);
		try {
			const response = await fetch("http://localhost:3000/");
			const msg = await response.json();
			if (msg.error.message) throw msg.error;
			setView({ entries: msg.entries, exits: msg.exits });
		} catch (error) {
			showAlert("error", error.message);
		} finally {
			setLoading(false);
		}
	}

	async function handleApiCall(status) {
		setLoading(true);
		try {
			const response = await fetch("http://localhost:3000/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status })
			});
			// console.log(response.data)
			// if (!response.ok) throw new Error("Failed to add data");

			const msg = await response.json();
			console.log(msg);
			showAlert(msg.msg.includes("already") ? "warning" : "success", msg.msg);
			if (!msg.msg.includes("already")) fetchTimes();
		} catch (error) {
			showAlert("error", error.message);
		} finally {
			setLoading(false);
		}
	}

	function showAlert(icon, text) {
		Swal.fire({
			icon,
			title: "Message",
			text,
			showConfirmButton: true,
			timer: 2500
		});
	}

	return (
		<>
			<h1>Time Recorder</h1>
			<div className="card">
				<button onClick={() => handleApiCall("Entry")}>Entry</button>
				<span>
					<input className="search-input" type="search" placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
				</span>
				<button onClick={() => handleApiCall("Exit")}>Exit</button>
			</div>
			<div className="times-table-container">{loading ? <p>Loading...</p> : <View view={view} fetchTimes={fetchTimes} search={search} />}</div>
		</>
	);
}

export default App;
