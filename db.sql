-- db.sql

-- Table for Clients
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Partners
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Service Orders (OS)
CREATE TABLE IF NOT EXISTS os (
    id VARCHAR(36) PRIMARY KEY,
    numero VARCHAR(6) UNIQUE NOT NULL,
    projeto VARCHAR(255) NOT NULL,
    tarefa TEXT NOT NULL,
    observacoes TEXT,
    tempoTrabalhado TEXT,
    status ENUM('Na Fila', 'Aguardando Cliente', 'Em Produção', 'Aguardando Parceiro', 'Finalizado') NOT NULL DEFAULT 'Na Fila',
    dataAbertura DATETIME NOT NULL,
    dataFinalizacao DATETIME,
    programadoPara DATE,
    isUrgent BOOLEAN NOT NULL DEFAULT FALSE,
    dataInicioProducao DATETIME,
    tempoProducaoMinutos INT,
    cliente_id VARCHAR(36) NOT NULL,
    parceiro_id VARCHAR(36),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clients(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (parceiro_id) REFERENCES partners(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Optional: Indexes for frequently queried columns
CREATE INDEX idx_os_status ON os(status);
CREATE INDEX idx_os_cliente_id ON os(cliente_id);
CREATE INDEX idx_os_programadoPara ON os(programadoPara);
