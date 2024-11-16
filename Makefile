# Detect the OS
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname -s)
endif

# Set variables based on the detected OS
ifeq ($(DETECTED_OS),Windows)
    EXE := .\bin\typevier.exe
    RM := del
    MKDIR := if not exist .\bin mkdir .\bin
else
    EXE := ./bin/typevier
    RM := rm -f
    MKDIR := mkdir -p ./bin
endif

all: build run

build:
	@echo Make: Building source...
	@$(MKDIR)
ifeq ($(DETECTED_OS),Windows)
	@go build -o $(EXE) .\backend\cmd\typevier
else
	@go build -o $(EXE) ./backend/cmd/typevier
endif

run:
	@echo Make: Running app...
	@$(EXE)

clean:
	@echo Make: Cleaning up...
	@$(RM) $(EXE)
