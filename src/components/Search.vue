<script setup lang="ts">
	import { ref } from 'vue'
	const emit = defineEmits<{
		(e: 'searchEvent', props: any): void
	}>()
	
	const searchData = defineProps<{
		data: any,
	}>();
	const formData: any = ref(searchData.data);
	const resultOptions = [
		{ group: 'White Wins', disable: true },
		{ label: 'X-0', value: 'X-0', description: 'Search by Any win' },
		{ label: 'R-0', value: 'R-0', description: 'Search by Road win' },
		{ label: 'F-0', value: 'F-0', description: 'Search by Flat win' },
		{ label: '1-0', value: '1-0', description: 'Search by Time or Resignation win' },
		{ group: 'Black Wins', disable: true },
		{ label: '0-X', value: '0-X', description: 'Search by Any win' },
		{ label: '0-R', value: '0-R', description: 'Search by Road win' },
		{ label: '0-F', value: '0-F', description: 'Search by Flat win' },
		{ label: '0-1', value: '0-1', description: 'Search by Time or Resignation win' },
		{ group: 'Draw', disable: true },
		{ label: '1/2-1/2', value: '1/2-1/2', description: 'Search by Draw' }
	];
	const sizeOptions = [
		{ label: '3 x 3', value: '3' },
		{ label: '4 x 4', value: '4' },
		{ label: '5 x 5', value: '5' },
		{ label: '6 x 6', value: '6' },
		{ label: '7 x 7', value: '7' },
		{ label: '8 x 8', value: '8' },
	];
	const typeOptions: Array<any> = [
		{ label: "Nomal", value: { name: "normal", value: 1} },
		{ label: "Tournament", value: { name: "tournament", value: 1 } },
		{ label: "Unrated", value: { name: "unrated", value: 1 } },
	];

	function clearForm() {
		formData.value = { mirror: false, partial_user: false}
	}

	function sendFormData () {
		emit('searchEvent', formData.value)
	}

</script>

<template>
	<q-expansion-item expand-separator label="Search" class="search row justify-around q-mt-md" default-opened>
		<q-card class="my-card q-mt-md">
			<q-card-section class="search-wrapper">
				<q-form @submit="sendFormData" @reset="clearForm()">
					<div class="row justify-around">
						<div class="col-4">
						<q-input v-model="formData.id" label="Game ID" type="number" />
							<q-input v-model="formData.player_white" label="Player White" />
							<q-input v-model="formData.player_black" label="Player Black" />
							
						</div>
						<div class="col-4">
							<q-select v-model="formData.type" :options="typeOptions" label="Game Type" clearable single-line
								options-selected-class="text-deep-orange">
							</q-select>
							<q-select v-model="formData.game_result" :emit-value=true :options="resultOptions" label="Game Result" clearable
								options-selected-class="text-deep-orange">
								<template v-slot:option="scope">
									<q-item-label header v-if="scope.opt.group" v-bind="scope.itemProps">{{ scope.opt.group }}</q-item-label>
									<q-item v-if="!scope.opt.group" v-bind="scope.itemProps" v-on="scope">
										<q-item-section>
											<q-item-label v-html="scope.opt.label"></q-item-label>
											<q-item-label caption>{{ scope.opt.description }}</q-item-label>
										</q-item-section>
									</q-item>
								</template>
							</q-select>
							<q-select v-model="formData.size" :options="sizeOptions" label="Board Size" clearable single-line
								options-selected-class="text-deep-orange">
							</q-select>
						</div>
					</div>
					<div class="row justify-around">
						<q-expansion-item expand-separator label="Advanced Options" class="row justify-around items-start q-mt-md">
							<q-card>
								<q-card-section>
									<q-toggle v-model="formData.mirror" label="Mirror search" /><br>
									<q-toggle v-model="formData.partial_user" label="Partial username search" />
								</q-card-section>
							</q-card>
						</q-expansion-item>
						<div class="row justify-end items-start q-mt-md">
							<q-btn class="q-mr-md" rounded color="primary" label="Search" type="submit" />
							<q-btn outline rounded color="" label="Cancel" type="reset" />
						</div>
					</div>
				</q-form>
			</q-card-section>
		</q-card>
	</q-expansion-item>
</template>

<style>
h5 {
	margin: 0;
}
.gap-16{
	gap: 16px;
}
.search > .q-expansion-item__container {
	width: 80vw;
}
.search-wrapper {
	width: 80vw;
}
</style>
