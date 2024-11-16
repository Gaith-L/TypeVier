all: build run

build:
	@echo Make: Building source...
	@go build -o .\bin\typevier.exe .\backend\cmd\typevier

run:
	@echo Make: Running app...
	@.\bin\typevier.exe

clean:
	del .\bin\typevier.exe
