# Digital Twin Frontend Development Roadmap

This roadmap outlines the step-by-step development of a React frontend for the Dual-System Digital Twin backend. Each phase builds upon the previous one, allowing for incremental testing and learning.

## Phase 1: Basic Setup & Foundation

### 1.1 Project Setup
- [x] Initialize React + Vite project with TypeScript
- [x] Install essential dependencies (React, TypeScript, Vite)
- [x] Configure development environment
- [x] Set up basic project structure
- [x] Verify that `npm run dev` starts the development server

**Goal**: Have a working React development environment
**Deliverable**: Basic React app running on localhost:5173

### 1.2 API Client
- [x] Create `src/services/api.ts` file
- [x] Implement API client class with base URL configuration
- [x] Add TypeScript interfaces for API requests/responses
- [x] Implement methods for each backend endpoint:
  - `initSimulation(modelName, params?)`
  - `stepSimulation(sessionId, controlInput, deltaTime?)`
  - `getState(sessionId)`
  - `getHistory(sessionId)`
  - `getLogs(sessionId)`
  - `resetSimulation(sessionId, params?)`
  - `updateParams(sessionId, params)`
- [x] Add error handling for API calls
- [x] Generate TypeScript client from OpenAPI specification
- [x] Replace manual API types with generated types
- [x] Add OpenAPI generator script to package.json

**Goal**: Centralized API communication layer with type-safe generated client
**Deliverable**: Generated TypeScript client with proper type safety

- [x] Add unit tests for API client

### 1.3 Basic UI Layout
- [x] Install and configure Tailwind CSS
- [x] Create basic application layout with header and main content area
- [x] Add application title and basic navigation structure
- [x] Set up responsive container for main content
- [x] Test layout on different screen sizes

**Goal**: Foundation UI structure for the application
**Deliverable**: Clean, responsive layout ready for components

## Phase 2: Simulation Management

### 2.1 Model Selection
- [x] Create `ModelSelector` component
- [x] Add dropdown/radio buttons for model selection (water_tank, room_temperature)
- [x] Implement model selection state management
- [x] Add model descriptions or help text
- [x] Style the model selector component

**Goal**: User can choose which simulation model to use
**Deliverable**: Working model selection interface

### 2.2 Create Simulation
- [x] Create `SimulationInitializer` component
- [x] Add form for simulation initialization
- [x] Include optional parameters input (JSON or form fields)
- [x] Implement form validation
- [x] Connect to API client's `initSimulation` method
- [x] Handle loading states and success/error feedback
- [x] Store session ID in application state

**Goal**: User can create new simulation sessions
**Deliverable**: Functional simulation creation form

### 2.3 Basic State Display

 - [x] Create `StateDisplay` component
 - [x] Fetch and display current simulation state
 - [x] Format state data in a readable way (table or cards)
 - [x] Add refresh button to manually update state
 - [x] Handle cases where no simulation is active
 - [x] Style the state display for clarity

**Goal**: User can see current simulation state
**Deliverable**: Real-time state monitoring interface

## Phase 3: Simulation Control

### 3.1 Step Controls
- [x] Create `SimulationControls` component
- [x] Add "Step Forward" button
- [x] Implement step-by-step simulation advancement
- [x] Display step count or simulation time
- [x] Add loading indicators during step operations
- [x] Update state display after each step
- [x] Handle step errors gracefully

**Goal**: User can manually advance simulation
**Deliverable**: Step-by-step simulation control

### 3.2 Control Inputs
- [x] Add control input field/slider to SimulationControls
- [x] Implement different input types based on model
- [x] Add input validation and bounds checking
- [x] Show current control value clearly
- [x] Allow both manual input and slider interaction
- [x] Add helpful labels and units

**Goal**: User can control simulation parameters
**Deliverable**: Interactive control input interface

### 3.3 Reset Functionality
- [x] Add "Reset Simulation" button
- [x] Implement reset confirmation dialog
- [x] Connect to API client's `resetSimulation` method
- [x] Allow reset with new parameters
- [ ] Clear state display after reset
- [ ] Handle reset errors and feedback

**Goal**: User can restart simulations
**Deliverable**: Simulation reset functionality

## Phase 4: Data Visualization

### 4.1 State History Chart
- [ ] Install Recharts charting library
- [ ] Create `SimulationChart` component
- [ ] Fetch simulation history from API
- [ ] Display state variables as line charts over time
- [ ] Make charts responsive and interactive
- [ ] Add chart legends and axis labels
- [ ] Handle different data types and scales

**Goal**: Visualize simulation data over time
**Deliverable**: Interactive charts showing simulation history

### 4.2 Real-time Updates
- [ ] Implement automatic state polling
- [ ] Create custom hook for periodic data fetching
- [ ] Add start/stop auto-refresh functionality
- [ ] Configure appropriate refresh intervals
- [ ] Update charts in real-time
- [ ] Handle connection errors gracefully

**Goal**: Automatic data updates without manual refresh
**Deliverable**: Self-updating dashboard

### 4.3 Interactive Controls Enhancement
- [ ] Add real-time parameter sliders
- [ ] Implement immediate parameter updates via API
- [ ] Show parameter changes effect on simulation
- [ ] Add multiple control inputs for complex models
- [ ] Implement parameter presets or saved configurations
- [ ] Add parameter bounds and validation

**Goal**: Smooth, responsive simulation control
**Deliverable**: Advanced interactive controls

## Phase 5: Enhanced Features

### 5.1 Logs Display
- [ ] Create `LogsPanel` component
- [ ] Fetch and display simulation logs
- [ ] Implement log filtering and search
- [ ] Add timestamp formatting
- [ ] Enable log export functionality
- [ ] Style logs for readability

**Goal**: Access to simulation debugging information
**Deliverable**: Comprehensive logs viewer

### 5.2 Parameter Tuning
- [ ] Create advanced parameters editor
- [ ] Implement parameter update API integration
- [ ] Add parameter validation and type checking
- [ ] Show parameter descriptions and help
- [ ] Enable parameter import/export
- [ ] Add parameter change history

**Goal**: Fine-tune simulation behavior
**Deliverable**: Advanced parameter management

### 5.3 Export/Save Functionality
- [ ] Add data export capabilities (JSON, CSV)
- [ ] Implement chart image export
- [ ] Add simulation session saving
- [ ] Enable simulation data download
- [ ] Create shareable simulation links
- [ ] Add export format options

**Goal**: Save and share simulation results
**Deliverable**: Comprehensive export system

## Phase 6: Polish & UX

### 6.1 Error Handling
- [ ] Implement comprehensive error boundaries
- [ ] Add user-friendly error messages
- [ ] Create error recovery mechanisms
- [ ] Add network connectivity handling
- [ ] Implement retry functionality
- [ ] Add error reporting/logging

**Goal**: Robust error handling throughout the application
**Deliverable**: Reliable, user-friendly error management

### 6.2 Responsive Design
- [ ] Test and optimize for mobile devices
- [ ] Implement responsive chart sizing
- [ ] Optimize touch interactions
- [ ] Add mobile-friendly navigation
- [ ] Test on various screen sizes
- [ ] Optimize performance for mobile

**Goal**: Great experience on all devices
**Deliverable**: Fully responsive application

### 6.3 UI/UX Improvements
- [ ] Conduct user experience review
- [ ] Improve visual design and aesthetics
- [ ] Add animations and transitions
- [ ] Implement keyboard shortcuts
- [ ] Add tooltips and help text
- [ ] Optimize loading states and feedback
- [ ] Add dark mode support (optional)

**Goal**: Polished, professional user experience
**Deliverable**: Production-ready application

## Success Criteria

- [ ] Users can create simulations for both water_tank and room_temperature models
- [ ] Real-time state monitoring works reliably
- [ ] Interactive controls respond smoothly
- [ ] Charts display data clearly and update automatically
- [ ] Application handles errors gracefully
- [ ] Interface is intuitive and responsive
- [ ] All major features work without backend errors

## Technical Decisions Log

- **Framework**: React + TypeScript for type safety and component reusability
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for utility-first responsive design
- **Charts**: Recharts for React-native charting components
- **State Management**: React hooks and context (upgrade to Redux if needed)
- **API Communication**: Fetch API with custom client wrapper
- **Error Handling**: Error boundaries and user-friendly error messages

## Notes

- Each phase should be fully tested before moving to the next
- Regular demos and feedback sessions with stakeholder
- Code should be well-documented for learning purposes
- Commit changes frequently with descriptive messages
- Update this roadmap as requirements evolve
