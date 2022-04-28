import React, { useState, useEffect,useRef,useMemo,useCallback } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listConcepts } from './graphql/queries';
import { createConcept as createConceptMutation, deleteConcept as deleteConceptMutation } from './graphql/mutations';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';


const initialFormState = { displayName: '', description: '',alternateName:'' };
const mockData =[{ id: 'aa', displayName: 'Diagnosis', description: 'Entity domain',alternateName:'' },
{ id: 'bb', displayName: 'Disease of Nervous System', description: 'Diseases targeting the nervous system',alternateName:'' },
{ id: 'cc',displayName: 'Disease of Eye', description: 'Disease Targeting Eye',alternateName:'' },
{ id: 'dd',displayName: 'Multiple Sclerosis (MS)', description: 'Multiple Sclerosis',alternateName:'MS,name1,name2' },
];
function App() {
  const [concepts, setConcept] = useState(mockData);
  const [formData, setFormData] = useState(initialFormState);
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [columnDefs, setColumnDefs] = useState([
    { field: 'displayName',  editable: true,     filter: 'agTextColumnFilter',
    filterParams: {
      caseSensitive: true,
      defaultOption: 'startsWith',
    }, },
    { field: 'description',  editable: true },
    { field: 'alternateName',  editable: true },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      editable: true,
      sortable: true,
      filter: true,
    };
  }, []);
  const getRowId = useCallback(function (params) {
    return params.data.id;
  }, []);

  const updateSort = useCallback(() => {
    gridRef.current.api.refreshClientSideRowModel('sort');
  }, []);

  const updateFilter = useCallback(() => {
    gridRef.current.api.refreshClientSideRowModel('filter');
  }, []);

  const contains = (target, lookingFor) => {
    return target && target.indexOf(lookingFor) >= 0;
  };
  
  var conceptFilterParams = {
    filterOptions: ['contains', 'notContains'],
    textFormatter: function (r) {
      if (r == null) return null;
      return r
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y');
    },
    debounceMs: 200,
    suppressAndOrCondition: true,
  };

  const onGridReady = useCallback((params) => {
    fetch('apiEndPoint')
      .then((resp) => resp.json())
      .then((data) => {
        params.api.setServerSideDatasource(datasource);
      });
  }, []);

  useEffect(() => {
    fetchConcept();
  }, []);

  async function fetchConcept() {
    // const apiData = await API.graphql({ query: listConcept });
    // setConcept(apiData.data.listConcept.items);
    setConcept(mockData);
  }

  async function createConcept() {
    if (!formData.displayName || !formData.description || !formData.alternateName) return;
    await API.graphql({ query: createConceptMutation, variables: { input: formData } });
    setConcept([ ...concepts, formData ]);
    setFormData(initialFormState);
  }

  async function deleteConcept({ id }) {
    const newConceptArray = concepts.filter(concept => concept.id !== id);
    setConcept(newConceptArray);
    await API.graphql({ query: deleteConceptMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>Master Ontology</h1>
      <input
        onChange={e => setFormData({ ...formData, 'displayName': e.target.value})}
        placeholder="Concept name"
        value={formData.displayName}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Concept description"
        value={formData.description}
      />
      <input
        onChange={e => setFormData({ ...formData, 'alternateName': e.target.value})}
        placeholder="Alternate Name"
        value={formData.alternateName}
      />
      <button onClick={createConcept}>Create Concept</button>
<div style={containerStyle}>
      <div className="example-wrapper">
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={updateSort} style={{ marginLeft: '15px' }}>
            Sort
          </button>
          <button onClick={updateFilter}>Filter</button>
        </div>

        <div style={gridStyle} style={{height: '500px'}} className="ag-theme-alpine">
          <AgGridReact
            ref={gridRef}
            rowData={concepts}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            getRowId={getRowId}
          ></AgGridReact>
          {/* <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType={'serverSide'}
          serverSideStoreType={'partial'}
          onGridReady={onGridReady}
        ></AgGridReact> */}
        </div>
      </div>
    </div>
      {/* <AmplifySignOut /> */}
    </div>
  );
}

// export default withAuthenticator(App);
export default App;