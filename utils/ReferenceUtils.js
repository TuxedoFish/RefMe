// Definition of the different citation styles
import { CITATION_STYLES } from '../screens/ReferencesScreen/Constants'
// Utility for configuring dates
import { formatDateForReference, formatDateForHarvardReference, 
    getDateFromISOString, formatDateForMLAReference, 
    formatDateForRSCReference, convertISOtoX5gon } from './DateUtils'
// For making API requests
import axios from 'axios'
// Page Types constants
import { PAGE_TYPES } from '../screens/ArticlesScreen/Constants'

export async function generateCitation(id, meta, onSuccess, onFailed) {
    // Fetch data from X5gon and combine with pdf meta
    // TODO: Implement this function
    // 10937: {
    //   id: 10937,
    //   author: "John Doe",
    //   title: "ML Algorithms",
    //   uploadedDate: 30817921,
    //   accessedDate: 30817921,
    //   publisher: "VideoLectures.Net",
    //   url: "https://www.website.com",
    //   type: (ENUM)
    //   pages: "1-4", (This will be a feature on the citation screen)
    //   ...
    // }

    // Setup to make a query for the document
    const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
    const ENDPOINT = "/oer_materials/" + id
    const url = PLATFORM_URL + ENDPOINT

    axios.get(url, {} )
    .then(res => {
        // Get the response from x5gon
        const article = res.data.oer_materials
        // Generate accessed date
        const accessed_date = new Date().toISOString();
        // Get the published date from PDF metadata (also option ref.creation_date===null ? ref.retrieved_date : ref.creation_date)
        const published_date = meta.modDate ? meta.modDate : convertISOtoX5gon(article.creation_date)
        // Get the author from PDF metadata
        const author = meta.author==="" ? "Unknown" : meta.author
        // Publisher
        const publisher = article.provider.provider_name
        // Link
        const url = article.url
        // Title of paper
        const title = article.title

        // Put it all together:
        const citation = {
            id: id,
            accessed_date: accessed_date,
            published_date: published_date,
            author: author,
            publisher: publisher,
            url: url,
            title: title,
            type: PAGE_TYPES.PDF
        }
        // Callback function
        onSuccess(id, citation)
    })
    .catch(error => {
        onFailed(error)
    })
}

export async function generateHistoryItemForAPI(id, oldItem, onSuccess, onFailed) {

    // Setup to make a query for the document
    const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
    const ENDPOINT = "/oer_materials/" + id
    const url = PLATFORM_URL + ENDPOINT
    console.log("GENERATING")

    axios.get(url, {} )
    .then(res => {
        
        // Get the response from x5gon
        const article = res.data.oer_materials
        // Generate accessed date
        const accessed_date = new Date().toISOString();
        // Get the published date from PDF metadata (also option ref.creation_date===null ? ref.retrieved_date : ref.creation_date)
        const published_date = convertISOtoX5gon(article.creation_date)
        // Get the author from PDF metadata
        const author = "Unknown"
        // Publisher
        const publisher = article.provider.provider_name
        // Link
        const url = article.url
        // Title of paper
        const title = article.title

        // Put it all together:
        const historyItem = {
            id: id,
            currentpage: oldItem.currentpage,
            length : oldItem.length,
            lastmodified: oldItem.lastmodified,
            author: author,
            title: title,
            publisher: publisher,
            description: '',
            published_date: published_date,
            accessed_date: accessed_date,
            url: url,
            type: PAGE_TYPES.PDF
        }
        // Callback function
        onSuccess(id, historyItem)
    })
    .catch(error => {
        onFailed(error)
    })
}



export async function generateHistoryItem(id, oldItem, onSuccess, onFailed) {

    // Setup to make a query for the document
    const PLATFORM_URL = "https://platform.x5gon.org/api/v1"
    const ENDPOINT = "/oer_materials/" + id
    const url = PLATFORM_URL + ENDPOINT

    axios.get(url, {} )
    .then(res => {
        // Get the response from x5gon
        const article = res.data.oer_materials
        // Generate accessed date
        const lastmodified = new Date().toISOString();
        // Link
        const url = article.url
        // Title of paper
        const title = article.title

        // Put it all together:
        const historyItem = {
            id: id,
            currentpage: oldItem.currentpage,
            length : oldItem.length,
            lastmodified: lastmodified,
            title: title,
            url: url,
            type: PAGE_TYPES.PDF
        }
        // Callback function
        onSuccess(id, historyItem)
    })
    .catch(error => {
      onFailed(error)
    })
}

export function generateTextForCitation(citation, index, style) {
    switch(style) {
        case CITATION_STYLES.APA: {
            return generateAPACitation(citation, index)
        }
        
        case CITATION_STYLES.MLA: {
            return generateMLACitation(citation, index)
        }
        
        case CITATION_STYLES.CHICAGO: {
            return generateChicagoCitation(citation, index)
        }
        
        case CITATION_STYLES.HARVARD: {
            return generateHarvardCitation(citation, index)
        }
        
        case CITATION_STYLES.IEEE: {
            return generateIEEECitation(citation, index)
        }

        case CITATION_STYLES.VANCOUVER: {
            return generateVancouverCitation(citation, index)
        }

        case CITATION_STYLES.NATURE: {
            return generateNatureCitation(citation, index)
        }

        case CITATION_STYLES.RSC: {
            return generateRSCCitation(citation, index)
        }
        
        default: {
            // Return APA style as the default
            return generateAPACitation(citation, index)
        }
    }
}

/* 
Slat, B. (2019, April 10). Whales likely impacted by Great Pacific garbage patch. The Ocean Cleanup. https://www.theoceancleanup.com/updates/whales-likely-impacted-by-great-pacific-garbage-patch/
*/
export function generateAPACitation(citation, index) {

    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const published_date_formatted = formatDateForMLAReference(getDateFromISOString(published_date))
    
    // Tenuous TODO: Make this better
    const names = author.split(' ')
    const last_name = names[names.length - 1]
    const first_initial = names[0].substring(0, 1).toUpperCase()

    // Return the raw text style of the citation
    return `${last_name}, ${first_initial}. (${published_date_formatted}). ${title}. ${publisher}. ${url}`
}

/*
Felluga, Dino. Survey of the Literature of England. Purdue U, Aug. 2006, web.ics.purdue.edu/~felluga/241/241/Home.html. Accessed 31 May 2007.
*/
export function generateMLACitation(citation, index) {
    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const accessed_date_formatted = formatDateForHarvardReference(getDateFromISOString(accessed_date))
    const published_date_formatted = formatDateForHarvardReference(getDateFromISOString(published_date))

    // Return the raw text style of the citation
    return `${author}. ${title}. ${publisher}, ${published_date_formatted}, ${url}. Accessed ${accessed_date_formatted}.`
}

/*
Lastname, Firstname. “Title of Web Page.” Name of Website. Publishing organization, publication or revision date if available. Access date if no other date is available. URL .
*/
export function generateChicagoCitation(citation, index) {

    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const accessed_date_formatted = formatDateForHarvardReference(getDateFromISOString(accessed_date))
    const published_date_formatted = formatDateForHarvardReference(getDateFromISOString(published_date))
    
    // Tenuous TODO: Make this better
    const names = author.split(' ')
    const last_name = names[names.length - 1]
    const first_name = names[0]

    // Return the raw text style of the citation
    return `${last_name}, ${first_name}. "${title}" ${publisher}. ${published_date_formatted}. ${accessed_date_formatted}. ${url}`
}

/*
Last name, First initial. (Year published). Article Title. Journal, [online] Volume(Issue), pages. Available at: URL [Accessed Day Mo. Year].
*/
export function generateHarvardCitation(citation, index) {

    // Destructure elements from citation 
    console.log(citation)
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const accessed_date_formatted = formatDateForHarvardReference(getDateFromISOString(accessed_date))
    const published_year = getDateFromISOString(published_date).getFullYear()
    
    // Tenuous TODO: Make this better
    const names = author.split(' ')
    const last_name = names[names.length - 1]
    const first_initial = names[0].substring(0, 1).toUpperCase()

    // Return the raw text style of the citation
    return `${last_name}, ${first_initial}. (${published_year}). ${title}. ${publisher}, [Online]. Available at: ${url} [Accessed ${accessed_date_formatted}].`
}

/*
[31] European Telecommunications Standards Institute, “Digital Video Broadcasting (DVB): 
Implementation guidelines for DVB terrestrial services; transmission aspects,” 
European Telecommunications Standards Institute, ETSI TR-101-190, 1997. 
[Online]. Available: http://www.etsi.org. [Accessed: Aug. 17, 1998].
*/
export function generateIEEECitation(citation, index) {

    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const accessed_date_formatted = formatDateForReference(getDateFromISOString(accessed_date))
    const published_year = getDateFromISOString(published_date).getFullYear()

    // Return the raw text style of the citation
    return `[${index+1}] ${author}, "${title}" ${publisher}, ${published_year}. [Online]. Available: ${url}. [Accessed: ${accessed_date_formatted}]`
}

/*
1. Gaudin S. How moon landing changed technology history [Internet]. 
Computerworld UK. 2009 [cited 15 June 2014].
 Available from: http://www.computerworlduk.com/in-depth/it-business/2387/how-moon-landing-changed-technology-history/
*/
export function generateVancouverCitation(citation, index) {

    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const published_date_formatted = formatDateForHarvardReference(getDateFromISOString(published_date))
    const published_year = getDateFromISOString(published_date).getFullYear()
    
    // Tenuous TODO: Make this better
    const names = author.split(' ')
    const last_name = names[names.length - 1]
    const first_initial = names[0].substring(0, 1).toUpperCase()

    // Return the raw text style of the citation
    return `${index+1}. ${last_name}, ${first_initial}. ${title} [Internet]. ${publisher}. ${published_year} [cited ${published_date_formatted}]. Available from: ${url}`
}

/*
1.
Author1 LastnameA. F. & Author2 LastnameA. F. Title. https://www.example.com (2000).
*/
export function generateNatureCitation(citation, index) {

    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const published_date_year = getDateFromISOString(published_date).getFullYear()
    
    // Tenuous TODO: Make this better
    const names = author.split(' ')
    const last_name = names[names.length - 1]
    const first_initial = names[0].substring(0, 1).toUpperCase()

    // Return the raw text style of the citation
    return `${index+1}. ${last_name}, ${first_initial}. ${title}. ${url} (${published_date_year})`
}

/*
Online resources should be citied in the form: Name of resource, URL, (accessed date). Please note
the most important information to include is the URL and the date accessed.
 The Merck Index Online, http://www.rsc.org/Merck-Index/monograph/mono1500000841, (accessed
October 2013).
*/
export function generateRSCCitation(citation, index) {
    // Destructure elements from citation 
    const { author, accessed_date, published_date, publisher, url, title} = citation

    // Formatting of data for formatting style
    const accessed_date_formatted = formatDateForRSCReference(getDateFromISOString(accessed_date))

    // Return the raw text style of the citation
    return `${title}, ${url}, (accessed ${accessed_date_formatted}).`
}