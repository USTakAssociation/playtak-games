<script setup lang="ts">
	import { computed, ref, watch } from 'vue';
	import { LocalStorage } from 'quasar';

	const emit = defineEmits<{
		(e: 'pageEvent', props: any): void,
		(e: 'copyEvent', game: any): void,
		(e: 'viewEvent', game: any): void,
		(e: 'downloadEvent', game: any): void,
		(e: 'update:pagination', game: any): void,
		(e: 'openEvent', game: any, site: string, newTab: boolean): void,
	}>()
	const tableData = defineProps<{
		data: any,
		pagination: {}
	}>()
	
	const columns: any= [
		{ name: "id", label: "ID", field: "id", align: "left" },
		{ name: "size", label: "Size", field: "size", align: "left" },
		{ name: "rules", label: "Rules", field: "komi", align: "left" },
		{ name: "clock", label: "Clock", field: "", align: "left" },
		{ name: "white", label: "White", field: "player_white", align: "left" },
		{ name: "black", label: "Black", field: "player_black", align: "left" },
		{ name: "result", label: "Result", field: "result", align: "left" },
		{ name: "date", label: "Time UTC", field: "date", align: "left" },
		{ name: "type", label: "Type", field: "", align: "left" },
		{ name: "notation", label: "Notation", field: "", align: "center" },
		{ name: "review", label: "Review", field: "", align: "center" }
	];
	const rowsPerPage = [15, 25, 50, 100];
	const pagination: any = computed({
		get() {
			return tableData.pagination
		},
		set(value) {
			emit('update:pagination', value);
		}
	});

	const visibleColumns: any = ref(
		LocalStorage.getItem("visibleColumns") ||
		['id', 'date', 'size', 'rules', 'clock', 'type', 'white', 'black', 'result', 'notation', 'review']
	);
	watch(visibleColumns, (value) => LocalStorage.set("visibleColumns", value));

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
	
	function handleCopyPTN(game: any) {
		emit('copyEvent', game);
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
		class="sticky-header"
		:rows="tableData.data" 
		:columns="columns" 
		row-key="name" 
		v-model:pagination="pagination" 
		:rows-per-page-options="rowsPerPage"
		@request="handleRequest"
		color="primary"
		:visible-columns="visibleColumns"
		square
		flat
	>
		<template v-slot:top>
			<div class="full-width row justify-between">
				<slot />
				<q-select v-model="visibleColumns" multiple outlined dense :display-value="$q.screen.gt.xs ? $q.lang.table.columns : ''"
				emit-value map-options :options="columns" option-value="name" options-cover rounded>
					<template v-slot:prepend>
						<q-icon name="view_column" />
					</template>
				</q-select>
			</div>
		</template>

		<template v-slot:body="props">
			<q-tr :props="props">
				<q-td key="id" :props="props">
					{{ props.row.id }}
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
					<a :href="`./?player_white=${props.row.player_white}&mirror=true`" target="_blank">{{
						props.row.player_white }}</a><br>
					{{ generateRatingString(props.row, 'white')}}
				</q-td>
				<q-td key="black" :props="props">
					<a :href="`./?player_black=${props.row.player_black}&mirror=true`" target="_blank">{{ props.row.player_black }}</a><br>
					{{ generateRatingString(props.row, 'black')}}
				</q-td>
				<q-td key="result" :props="props">
					{{props.row.result}}
				</q-td>
				<q-td key="date" :props="props">
					{{ formatDate(props.row.date) }}
				</q-td>
				<q-td key="type" :props="props">
					{{getGameType(props.row)}}
				</q-td>
				<q-td key="notation" :props="props">
					<q-btn-group flat rounded>
						<q-btn icon="visibility" @click="handleViewPTN(props.row)" color="primary" flat />
						<q-btn icon="content_copy" @click="handleCopyPTN(props.row)" color="primary" flat />
						<q-btn icon="download" @click="handleDownload(props.row)" color="primary" flat />
					</q-btn-group>
				</q-td>
				<q-td key="review" :props="props">
					<q-btn-group flat rounded>
						<q-btn label="Play Tak" @click="handleOpen(props.row, 'playtak')" color="primary" flat />
						<q-btn label="PTN Ninja" @click="handleOpen(props.row, 'ptnninja')" color="primary" flat />
					</q-btn-group>
				</q-td>
			</q-tr>
		</template>
	</q-table>
</template>

<style lang="scss">

.sticky-header {
	height: calc(100vh - #{$toolbar-min-height});
}
.sticky-header .q-table__top,
.sticky-header .q-table__bottom,
.sticky-header thead tr:first-child th {
	/* bg color is important for th; just specify one */
	background-color: $grey-1;
	body.body--dark & {
		background-color: $dark;
	}
}

.sticky-header thead tr th {
	position: sticky;
	z-index: 1;
}
.sticky-header thead tr:last-child th {
	top: 48px;
}
/* height of all previous header rows */
.sticky-header thead tr:first-child th {
	top: 0;
}
</style>