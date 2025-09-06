import os

def create_code_archive(project_path, output_file):
    # List of relevant file extensions to include
    include_extensions = {
        '.js', '.jsx', '.ts', '.tsx', 
        '.css', '.scss', '.json', '.md',
        '.txt', '.config', '.html'
    }
    
    # Files/directories to exclude
    exclude_dirs = {'node_modules', '.next', 'build', 'dist'}
    exclude_files = {'package-lock.json', 'yarn.lock'}

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(project_path):
            # Remove excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, project_path)
                
                # Skip excluded files and directories
                if any(file in exclude_files for file in rel_path.split(os.sep)):
                    continue
                
                # Check file extension
                _, ext = os.path.splitext(file)
                if ext.lower() in include_extensions:
                    try:
                        # Write file header
                        outfile.write(f'//{rel_path}\n')
                        
                        # Read and write file content
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            contents = infile.read()
                            outfile.write(contents)
                        
                        # Add spacing between files
                        outfile.write('\n\n')
                    except Exception as e:
                        print(f'Error processing {file_path}: {str(e)}')

if __name__ == '__main__':
    project_path = input('Enter path to your React project: ')
    output_file = 'project_code_archive.txt'
    
    if os.path.exists(project_path):
        create_code_archive(project_path, output_file)
        print(f'Successfully created {output_file} with all project files!')
    else:
        print('Invalid project path. Please try again.')