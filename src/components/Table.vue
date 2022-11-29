<script setup lang="ts">
	import { ref } from 'vue';
	const emit = defineEmits<{
		(e: 'pageEvent', props: any): void,
		(e: 'viewEvent', game: any): void,
		(e: 'downloadEvent', game: any): void,
		(e: 'openEvent', game: any, site: string, newTab: boolean): void,
	}>()
	const tableData = defineProps<{
		data: any,
		pagination: {}
	}>()
	
	const columns: any= [
		{ name: "id", label: "ID", field: "id", align: "left" },
		{ name: "date", label: "Time UTC", field: "date", align: "left" },
		{ name: "size", label: "Size", field: "size", align: "left" },
		{ name: "rules", label: "Rules", field: "komi", align: "left" },
		{ name: "clock", label: "Clock", field: "", align: "left" },
		{ name: "type", label: "Type", field: "", align: "left" },
		{ name: "white", label: "White", field: "player_white", align: "left" },
		{ name: "black", label: "Black", field: "player_black", align: "left" },
		{ name: "result", label: "Result", field: "result", align: "left" },
		{ name: "notation", label: "Notation", field: "", align: "center" },
		{ name: "review", label: "Review", field: "", align: "center" }
	];
	const rowsPerPage = [15, 25, 50, 100, 0];
	const pagination: any = ref(tableData.pagination);
	pagination.page - 1;
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
	
	function getGameType(game: any) {
		if(game.tournament === 1){
			return "Tournament";
		} else if(game.unrated === 1){
			return "Unrated";
		} else {
			return "Normal";
		}
	}
	
	function handleRequest(props: any) {
		emit('pageEvent', props);
	}
	
	function handleViewPTN(game: any) {
		emit('viewEvent', game);
	}
	
	function handleDownload(game: any) {
		emit('downloadEvent', game);
	}
	
	function handleOpen(game: any, site: string){
		emit('openEvent', game, site, true)
	}

</script>

<template>
	<q-table
		style ="max-height: 50vh"
		:rows="tableData.data.items" 
		:columns="columns" 
		row-key="name" 
		v-model:pagination="pagination" 
		:rows-per-page-options="rowsPerPage"
		virtual-scroll
		@request="handleRequest"
		>
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
				<q-td key="type" :props="props">
					{{getGameType(props.row)}}
				</q-td>
				<q-td key="white" :props="props">
					<a :href="`./?player_white=${props.row.player_white}&mirror=true`" target="_blank" class="text-light-blue">{{
						props.row.player_white }}</a><br>
					{{ generateRatingString(props.row, 'white')}}
				</q-td>
				<q-td key="black" :props="props">
					<a :href="`./?player_black=${props.row.player_black}&mirror=true`" target="_blank" class="text-light-blue">{{ props.row.player_black }}</a><br>
					{{ generateRatingString(props.row, 'black')}}
				</q-td>
				<q-td key="result" :props="props">
					{{props.row.result}}
				</q-td>
				<q-td key="notation" :props="props">
					<q-btn flat round color="light-blue" icon="download" @click="handleDownload(props.row)"/>
					<q-btn flat round color="light-blue" icon="visibility" @click="handleViewPTN(props.row)"/>
				</q-td>
				<q-td key="review" :props="props">
					<q-btn flat rounded color="light-blue" label="Play Tak" @click="handleOpen(props.row, 'playtak')"/>
					<q-btn flat rounded color="light-blue" label="PTN Ninja" @click="handleOpen(props.row, 'ptnninja')"/>
				</q-td>
			</q-tr>
		</template>
	</q-table>
</template>

<style scoped>
/* a {
	color: #fff;
} */
</style>