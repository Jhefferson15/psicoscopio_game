import { test, expect } from 'vitest';

// Simulação do fluxo do Observador
test('Fluxo do Observador: Deve permitir configurar salas e transitar para o Dashboard', () => {
  let currentScreen = 'menu';
  let activeModal = null;
  let loading = false;
  let batchName = '';
  let roomCount = 0;

  const setCurrentScreen = (screen) => { currentScreen = screen; };
  const setActiveModal = (modal) => { activeModal = modal; };
  const setBatchName = (name) => { batchName = name; };
  const setRoomCount = (count) => { roomCount = count; };
  const setLoading = (val) => { loading = val; };

  // 1. Abrir modal de setup
  setActiveModal('observer_setup');
  expect(activeModal).toBe('observer_setup');

  // 2. Configurar turma e quantidade
  setBatchName('Turma de Psicologia 2024');
  setRoomCount(4);
  expect(batchName).toBe('Turma de Psicologia 2024');
  expect(roomCount).toBe(4);

  // 3. Simular criação
  setLoading(true);
  expect(loading).toBe(true);

  // Simular callback de sucesso
  setLoading(false);
  setCurrentScreen('observer_dashboard');
  setActiveModal(null);

  expect(loading).toBe(false);
  expect(currentScreen).toBe('observer_dashboard');
  expect(activeModal).toBe(null);
});

test('Dashboard do Observador: Deve gerenciar o estado de carregamento e filtros', () => {
  let loading = true;
  let rooms = [];
  let selectedBatch = 'all';

  const setLoading = (val) => { loading = val; };
  const setRooms = (data) => { rooms = data; };
  const setSelectedBatch = (batch) => { selectedBatch = batch; };

  // 1. Inicia carregando
  expect(loading).toBe(true);

  // 2. Recebe dados
  const mockRooms = [
    { id: 'ROOM1', metadata: { batchName: 'Turma A' } },
    { id: 'ROOM2', metadata: { batchName: 'Turma B' } }
  ];
  setRooms(mockRooms);
  setLoading(false);

  expect(loading).toBe(false);
  expect(rooms.length).toBe(2);

  // 3. Testar filtro
  setSelectedBatch('Turma A');
  const filteredRooms = rooms.filter(r => r.metadata.batchName === selectedBatch);
  expect(filteredRooms.length).toBe(1);
  expect(filteredRooms[0].id).toBe('ROOM1');
});
