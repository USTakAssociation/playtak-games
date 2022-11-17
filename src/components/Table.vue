<script setup lang="ts">

	const tableData = defineProps<{
		data: any
	}>()
	
	const columns: any= [
		{ name: "id", label: "ID", field: "id", align: "left" },
		{ name: "date", label: "Time UTC", field: "date", align: "left" },
		{ name: "size", label: "Size", field: "size", align: "left" },
		{ name: "rules", label: "Rules", field: "komi", align: "left" },
		{ name: "clock", label: "Clock", field: "", align: "left" },
		{ name: "white", label: "White", field: "player_white", align: "left" },
		{ name: "black", label: "Black", field: "player_black", align: "left" },
		{ name: "result", label: "Result", field: "result", align: "left" },
		{ name: "notation", label: "Notation", field: "", align: "left" },
		{ name: "review", label: "Review", field: "", align: "left" }
	]

	function formatDate(date: number){
		let newDate = new Date(date).toISOString().split('T');
		return `${newDate[0]} ${newDate[1].split('.')[0]}`;
	}
	
	function formatKomi(komi: number) {
		const k1 = Math.floor(komi / 2).toString();
		const k2 = ((komi % 2) * 5).toString();
		return `${k1}.${k2}`;
	}
	
	function formatTimer(time: number) {
		let outstr = '';
		let minutes = Math.floor((time / 60));
		let seconds = time % 60;
		if (minutes > 0) {
			outstr = minutes.toString();
		}
		outstr += ':';
		if (seconds < 10) {
			outstr += '0';
		}
		outstr += seconds.toString();
		return outstr
	}
	
	function formatRatingChange(change: number) {
		let sign = "+";
		if (change < 0) {
			sign = "-"
			change = -change
		}
		let c1 = Math.floor(change / 10).toString();
		let c2 = (change % 10).toString();
		return `${sign}${c1}.${c2}`;
	}
	
	function generateRatingString(game: any, color: string){
		const gametime = game.date/1000;
		const abandonedtime = Date.now() - 3600 * 6;
		if (game.size < 5 || game.unrated == 1 || game.rating_white==0 || game.rating_black==0 || (game.result!="0-0" && game.notation.length<6) || (game.result=="0-0" && gametime < abandonedtime) || (game.rating_change_white==-2000 && game.rating_change_black==-2000) ) {
			if (game[`rating_${color}`] >= 100 ) {
				return game[`rating_${color}`].toString();
			}
			
		}else if (game.rating_change_white < 0 && game.rating_change_black < 0 ){
			if (game[`rating_${color}`] >= 100) {
				return game[`rating_${color}`].toString() + " +?";
			}
		} else{
			if (game[`rating_${color}`] >= 100) {
				return game[`rating_${color}`].toString() + " " + formatRatingChange(game[`rating_change_${color}`]);
			}
		}
	}
</script>

<template>
	<!-- <pre>{{tableData.data.items}}</pre> -->
	<q-table :rows="tableData.data.items" :columns="columns" row-key="name">
		<template v-slot:body="props">
			<q-tr :props="props">
				<q-td key="id" :props="props">
					{{ props.row.id }}
				</q-td>
				<q-td key="date" :props="props">
					{{ formatDate(props.row.date) }}
				</q-td>
				<q-td key="size" :props="props">
					{{ props.row.size }}x{{ props.row.size }}
				</q-td>
				<q-td key="rules" :props="props">
					<span v-if="props.row.komi > 0">
					 Komi: {{ formatKomi(props.row.komi) }}
					</span>
				</q-td>
				<q-td key="clock" :props="props">
					{{ formatTimer(props.row.timertime) }} +{{ formatTimer(props.row.timerinc)}}
				</q-td>
				<q-td key="white" :props="props">
					{{ props.row.player_white }} <br>
					{{ generateRatingString(props.row, 'white')}}
				</q-td>
				<q-td key="black" :props="props">
					{{ props.row.player_black }} <br>
					{{ generateRatingString(props.row, 'black')}}
				</q-td>
				<q-td key="result" :props="props">
					{{props.row.result}}
				</q-td>
				<q-td key="notation" :props="props">
					<!-- TODO -->
				</q-td>
				<q-td key="review" :props="props">
					<!-- TODO -->
				</q-td>
			</q-tr>
		</template>
		<!-- TODO pagination -->
	</q-table>
</template>
