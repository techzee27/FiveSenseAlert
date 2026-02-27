export function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}
