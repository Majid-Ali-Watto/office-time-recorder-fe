import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";

function View({ view, fetchTimes, search }) {
	const [data, setData] = useState([]);

	useEffect(() => {
		const length = Math.max(view.entries?.length || 0, view.exits?.length || 0);
		const times = Array.from({ length }, (_, index) => ({
			entry_time:
				view.entries?.[index]?.entry_time
					?.split("/")
					.map((m) => m?.padStart(2, "0"))
					?.join("/") || undefined,
			exit_time:
				view.exits?.[index]?.exit_time
					?.split("/")
					.map((m) => m?.padStart(2, "0"))
					?.join("/") || undefined,
			exit_day: view.exits?.[index]?.exit_day || undefined,
			entry_day: view.entries?.[index]?.entry_day || undefined,
			exit_date:
				view.exits?.[index]?.exit_date
					?.split("/")
					.map((m) => m?.padStart(2, "0"))
					?.join("/") || undefined,
			entry_date:
				view.entries?.[index]?.entry_date
					?.split("/")
					.map((m) => m?.padStart(2, "0"))
					?.join("/") || undefined,
			exitId: view.exits?.[index]?._id,
			entryId: view.entries?.[index]?._id
		}));
		setData(times);
	}, [view.entries, view.exits]);

	const filteredData = data.filter((val) => val.entry_time?.includes(search) || val.exit_time?.includes(search) || val.exit_day?.toLowerCase().includes(search.toLowerCase()) || val.entry_day?.toLowerCase().includes(search.toLowerCase()) || val.exit_date?.includes(search) || val.entry_date?.includes(search));

	async function handleRecord(action, record) {
		const method = action === "delete" ? "DELETE" : "PATCH";
		const url = `http://localhost:3000/${action === "delete" ? "delete" : "update"}`;
		const body = action === "delete" ? JSON.stringify({ record }) : JSON.stringify({ record });

		try {
			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body
			});

			if (!response.ok) throw new Error(`Failed to ${action} record`);
			const msg = await response.json();
			showAlert(msg.msg.includes("not found") ? "question" : "success", msg.msg);
			fetchTimes();
		} catch (error) {
			showAlert("error", error.message);
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

	function getWorkingHours(val) {
		const timestamp1 = new Date(`1970-01-01T${val?.entry_time?.replaceAll("/", ":")}`).getTime();
		const timestamp2 = new Date(`1970-01-01T${val?.exit_time?.replaceAll("/", ":")}`).getTime();
		const timeDifference = Math.abs(timestamp1 - timestamp2);
		const hours = Math.floor(timeDifference / (1000 * 60 * 60));
		const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
		return `${hours.toString().padStart(2, "0")}-${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`;
	}

	function showRow(row) {
		Swal.fire({
			icon: "info",
			html: `
        <div style="width:100%;display:flex;justify-content:center;">
          <table>
            <tr>
              <td style="text-align:left;font-weight:bold;"><b>Entry Time</b></td>
              <td style="text-align:right;">${row.entry_time}</td>
            </tr>
            <tr>
              <td style="text-align:left;font-weight:bold;"><b>Exit Time</b></td>
              <td style="text-align:right;">${row.exit_time}</td>
            </tr>
            <tr>
              <td style="text-align:left;font-weight:bold;">Day</td>
              <td style="text-align:right;">${row.exit_day || row.entry_day}</td>
            </tr>
            <tr>
              <td style="text-align:left;font-weight:bold;">Date</td>
              <td style="text-align:right;">${row.exit_date || row.entry_date}</td>
            </tr>
            <tr>
              <td style="text-align:left;font-weight:bold;">Working Hours</td>
              <td style="text-align:right;">${getWorkingHours(row)}</td>
            </tr>
          </table>
        </div>
      `,
			showCloseButton: true,
			showConfirmButton: false
		});
	}

	return (
		<div>
			<table className="times-table">
				<thead>
					<tr>
						<th>Day</th>
						<th>Date</th>
						<th>Entry Time</th>
						<th>Exit Time</th>
						<th>Working Hours</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{filteredData.map((val) => (
						<tr key={val.exitId} onClick={() => showRow(val)}>
							<td>{val.entry_day || val.exit_day}</td>
							<td>{val.entry_date || val.exit_date}</td>
							<td>{val.entry_time}</td>
							<td>{val.exit_time}</td>
							<td>{getWorkingHours(val)}</td>
							<td>
								<button onClick={() => handleRecord("delete", val.exitId)}>Delete</button>
								<button onClick={() => handleRecord("update", { ...val, exit_time: "New Exit Time" })}>Update</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

View.propTypes = {
	view: PropTypes.shape({
		entries: PropTypes.array.isRequired,
		exits: PropTypes.array.isRequired
	}).isRequired,
	fetchTimes: PropTypes.func.isRequired,
	search: PropTypes.string.isRequired
};

export default View;
