export const generateNameImage = (file: File,uid: string) => {
    return `${uid}-${Math.random()}.${file.name.split('.').pop()}`
}